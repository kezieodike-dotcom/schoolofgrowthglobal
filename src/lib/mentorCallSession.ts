import { communicationRequest, type MentorCall, type CallSignal, type ConversationRole } from './mentorCommunications';

export interface CallViewState {
  call: MentorCall | null; local: MediaStream | null; remote: MediaStream | null;
  connected: boolean; busy: boolean; error: string; muted: boolean; cameraOff: boolean;
}
interface CallResponse { call: MentorCall | null; signals?: CallSignal[]; iceServers: RTCIceServer[]; relayConfigured: boolean }
const active = (call: MentorCall | null) => call?.status === 'ringing' || call?.status === 'accepted';
const stop = (stream: MediaStream | null) => stream?.getTracks().forEach((track) => track.stop());

export class MentorCallSession {
  private call: MentorCall | null = null;
  private local: MediaStream | null = null;
  private remote: MediaStream | null = null;
  private peer: RTCPeerConnection | null = null;
  private live = true;
  private busy = false;
  private connected = false;
  private error = '';
  private epoch = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private disconnectTimer: ReturnType<typeof setTimeout> | undefined;
  private safetyTimer: ReturnType<typeof setTimeout> | undefined;
  private lastContact = Date.now();
  private polling = false;
  private processing = false;
  private processed = new Set<string>();
  private pending = new Map<string, CallSignal>();
  private candidates: RTCIceCandidateInit[] = [];
  private cursor = '';
  private ended = new Set<string>();
  private iceServers: RTCIceServer[] = [];
  private relayConfigured = false;
  private failures = 0;

  constructor(private threadId: string, private token: string, private role: ConversationRole,
    private changed: (state: CallViewState) => void) {}

  private emit() {
    if (this.live) this.changed({ call: this.call, local: this.local, remote: this.remote,
      connected: this.connected, busy: this.busy, error: this.error,
      muted: !!this.local && this.local.getAudioTracks().every((track) => !track.enabled),
      cameraOff: !this.local?.getVideoTracks().some((track) => track.enabled) });
  }
  private path(suffix = '') { return `/api/mentor-calls/${this.threadId}${suffix}`; }
  private request<T>(suffix = '', body?: unknown) {
    return communicationRequest<T>(this.path(suffix), this.token, body === undefined ? {} : { method: 'POST', body: JSON.stringify(body) });
  }
  private resetSignals() { this.processed.clear(); this.pending.clear(); this.candidates = []; this.cursor = ''; }
  private stopMedia() {
    this.epoch++;
    clearTimeout(this.disconnectTimer);
    clearTimeout(this.safetyTimer);
    if (this.peer) {
      this.peer.onicecandidate = null; this.peer.ontrack = null; this.peer.onconnectionstatechange = null;
      this.peer.close(); this.peer = null;
    }
    stop(this.local); stop(this.remote); this.local = null; this.remote = null; this.connected = false;
  }
  private armSafetyTimer() {
    clearTimeout(this.safetyTimer);
    const call = this.call;
    if (!call || !active(call)) return;
    const deadline = Math.min(Date.parse(call.expiresAt), this.lastContact + 45000);
    this.safetyTimer = setTimeout(() => {
      if (!this.live || this.call?.id !== call.id || !active(this.call)) return;
      const expired = Date.parse(this.call.expiresAt) <= Date.now();
      const status = expired && this.call.status === 'ringing' ? 'missed' : 'failed';
      this.ended.add(call.id); this.call = { ...this.call, status }; this.stopMedia(); this.busy = false;
      if (!expired) this.error = 'The call lost its connection. Please try again.';
      this.emit();
      void this.request(`/${call.id}/status`, { status: 'ended' }).catch(() => {});
    }, Math.max(0, deadline - Date.now()));
  }
  private visibility = () => { if (document.visibilityState === 'visible') void this.poll(); };

  begin() {
    document.addEventListener('visibilitychange', this.visibility);
    const tick = async () => {
      await this.poll();
      if (this.live) this.timer = setTimeout(tick, active(this.call) ? 1500 : 5000);
    };
    void tick();
  }

  private async poll() {
    if (!this.live || this.polling || (document.visibilityState === 'hidden' && !active(this.call))) return;
    this.polling = true;
    const query = new URLSearchParams();
    if (this.call) query.set('callId', this.call.id);
    if (this.cursor) query.set('after', this.cursor);
    try {
      const result = await this.request<CallResponse>(`?${query}`);
      if (!this.live) return;
      this.failures = 0;
      this.lastContact = Date.now();
      this.iceServers = result.iceServers; this.relayConfigured = result.relayConfigured;
      const next = result.call;
      if (!next || (this.call && Date.parse(next.createdAt) < Date.parse(this.call.createdAt))) return;
      // A poll can observe our server claim before the pending /start response returns.
      if (this.busy && !this.peer && next.caller === this.role && next.status === 'ringing') return;
      if (this.ended.has(next.id) && active(next)) {
        void this.request(`/${next.id}/status`, { status: 'ended' }).catch(() => {}); return;
      }
      if (next.id !== this.call?.id) {
        if (!active(next)) return;
        this.stopMedia(); this.resetSignals(); this.error = ''; this.call = next;
      } else this.call = next;
      if (!active(next)) this.stopMedia();
      else {
        for (const event of result.signals || []) {
          if (!this.processed.has(event.id)) this.pending.set(event.id, event);
          if (!this.cursor || event.createdAt > this.cursor) this.cursor = event.createdAt;
        }
        await this.processSignals();
        this.armSafetyTimer();
      }
      this.emit();
    } catch {
      if (this.live && ++this.failures >= 3) {
        this.error = active(this.call) ? 'Connection interrupted. Trying to reconnect...' : 'Calling is temporarily unavailable. You can still send a message.';
        this.emit();
      }
    } finally { this.polling = false; }
  }

  private async signal(type: CallSignal['type'], data: CallSignal['data'], callId: string) {
    for (let attempt = 0; attempt < 2; attempt++) {
      if (!this.live || this.call?.id !== callId || !active(this.call)) return;
      try { await this.request(`/${callId}/signals`, { type, data }); return; }
      catch (failure) {
        if (attempt) throw failure;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  private createPeer(stream: MediaStream) {
    const peer = new RTCPeerConnection({ iceServers: this.iceServers });
    const callId = this.call!.id;
    this.peer = peer; this.local = stream;
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    peer.onicecandidate = (event) => {
      if (event.candidate) void this.signal('ice', event.candidate.toJSON(), callId).catch(() => {
        if (this.live && this.peer === peer) { this.error = 'Call connection is taking longer than expected.'; this.emit(); }
      });
    };
    peer.ontrack = (event) => {
      if (this.peer !== peer) return;
      const incoming = event.streams[0];
      if (incoming) this.remote = incoming;
      else { this.remote ||= new MediaStream(); this.remote.addTrack(event.track); }
      this.emit();
    };
    peer.onconnectionstatechange = () => {
      if (this.peer !== peer) return;
      clearTimeout(this.disconnectTimer);
      if (peer.connectionState === 'connected') { this.connected = true; this.error = ''; this.emit(); }
      if (peer.connectionState === 'failed') void this.failConnection();
      if (peer.connectionState === 'disconnected') {
        this.error = 'Reconnecting call...'; this.emit();
        this.disconnectTimer = setTimeout(() => { if (this.peer === peer && peer.connectionState !== 'connected') void this.failConnection(); }, 15000);
      }
    };
    return peer;
  }

  private async failConnection() {
    await this.end('failed');
    this.error = this.relayConfigured ? 'The call disconnected. Check your connection and try again.'
      : 'This network could not connect the call. Try another network or contact support.';
    this.emit();
  }

  private async processSignals() {
    const peer = this.peer;
    if (!peer || this.processing || !active(this.call) || (this.call!.caller !== this.role && this.call!.status !== 'accepted')) return;
    this.processing = true;
    try {
      for (const [id, event] of this.pending) {
        if (!this.live || this.peer !== peer || !active(this.call)) break;
        if (event.type === 'ice') {
          if (peer.remoteDescription) await peer.addIceCandidate(event.data as RTCIceCandidateInit);
          else this.candidates.push(event.data as RTCIceCandidateInit);
        } else {
          if (!peer.remoteDescription) await peer.setRemoteDescription(event.data as RTCSessionDescriptionInit);
          for (const candidate of this.candidates.splice(0)) await peer.addIceCandidate(candidate);
          if (event.type === 'offer' && this.call!.caller !== this.role && !peer.localDescription) {
            const answer = await peer.createAnswer(); await peer.setLocalDescription(answer);
            await this.signal('answer', { type: 'answer', sdp: answer.sdp }, this.call!.id);
          }
        }
        this.processed.add(id); this.pending.delete(id);
      }
    } catch {
      if (this.peer === peer && this.live) await this.failConnection();
    } finally { this.processing = false; }
  }

  private async media(video: boolean) {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || typeof RTCPeerConnection === 'undefined') {
      throw new Error('Calling needs a recent browser with microphone access over a secure connection.');
    }
    return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true },
      video: video ? { width: { ideal: 960 }, height: { ideal: 540 }, facingMode: 'user' } : false });
  }
  private mediaError(failure: unknown) {
    return failure instanceof DOMException && failure.name === 'NotAllowedError'
      ? 'Camera or microphone access was denied. Allow access in your browser, or answer with audio only.'
      : failure instanceof Error ? failure.message : 'We could not access your microphone or camera.';
  }

  async start(mode: 'audio' | 'video') {
    if (this.busy || active(this.call) || !this.live) return;
    this.busy = true; this.error = ''; const epoch = ++this.epoch; this.emit();
    let stream: MediaStream | null = null;
    let createdCallId: string | undefined;
    try {
      stream = await this.media(mode === 'video');
      if (!this.live || epoch !== this.epoch) { stop(stream); return; }
      const result = await this.request<CallResponse>('/start', { mode });
      createdCallId = result.call?.id;
      if (!this.live || epoch !== this.epoch) {
        stop(stream);
        if (result.call) void this.request(`/${result.call.id}/status`, { status: 'ended' }).catch(() => {});
        return;
      }
      this.call = result.call; this.iceServers = result.iceServers; this.relayConfigured = result.relayConfigured;
      this.lastContact = Date.now(); this.armSafetyTimer();
      this.resetSignals();
      const peer = this.createPeer(stream);
      const offer = await peer.createOffer(); await peer.setLocalDescription(offer);
      await this.signal('offer', { type: 'offer', sdp: offer.sdp }, this.call!.id);
    } catch (failure) {
      stop(stream);
      if (this.live) { if (this.call?.id === createdCallId && active(this.call)) await this.end('failed'); this.error = this.mediaError(failure); }
    } finally { if (this.live) { this.busy = false; this.emit(); } }
  }

  async accept(audioOnly = false) {
    const call = this.call;
    if (!call || call.caller === this.role || call.status !== 'ringing' || this.busy) return;
    this.busy = true; this.error = ''; const epoch = ++this.epoch; this.emit();
    let stream: MediaStream | null = null;
    try {
      stream = await this.media(call.mode === 'video' && !audioOnly);
      if (!this.live || epoch !== this.epoch) { stop(stream); return; }
      const result = await this.request<{ call: MentorCall }>(`/${call.id}/status`, { status: 'accepted' });
      if (!this.live || epoch !== this.epoch || result.call.status !== 'accepted') { stop(stream); return; }
      this.call = result.call; this.lastContact = Date.now(); this.createPeer(stream); this.armSafetyTimer();
      await this.processSignals(); void this.poll();
    } catch (failure) { stop(stream); if (this.live) this.error = this.mediaError(failure); }
    finally { if (this.live) { this.busy = false; this.emit(); } }
  }

  async end(status: 'ended' | 'declined' | 'failed' = 'ended') {
    const call = this.call;
    this.stopMedia(); this.busy = false;
    if (call && active(call)) {
      this.ended.add(call.id); this.call = { ...call, status }; this.emit();
      try { await this.request(`/${call.id}/status`, { status }); } catch { /* Next poll retries terminal state. */ }
    }
    this.emit();
  }
  toggleMicrophone() { this.local?.getAudioTracks().forEach((track) => { track.enabled = !track.enabled; }); this.emit(); }
  toggleCamera() { this.local?.getVideoTracks().forEach((track) => { track.enabled = !track.enabled; }); this.emit(); }
  dismiss() { if (!active(this.call)) { this.call = null; this.error = ''; this.emit(); } }
  dispose() {
    this.live = false; clearTimeout(this.timer); document.removeEventListener('visibilitychange', this.visibility);
    if (active(this.call)) void fetch(this.path(`/${this.call!.id}/status`), { method: 'POST', keepalive: true,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token}` }, body: JSON.stringify({ status: 'ended' }) }).catch(() => {});
    this.stopMedia();
  }
}
