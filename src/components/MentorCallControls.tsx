import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, X, Loader2, Volume2 } from 'lucide-react';
import { MentorCallSession, type CallViewState } from '../lib/mentorCallSession';
import type { ConversationRole } from '../lib/mentorCommunications';

const initial: CallViewState = { call: null, local: null, remote: null, connected: false, busy: false, error: '', muted: false, cameraOff: false };
export function MentorCallControls({ threadId, token, role, peerName }: {
  threadId: string; token: string; role: ConversationRole; peerName: string;
}) {
  const [state, setState] = useState(initial);
  const [seconds, setSeconds] = useState(0);
  const [needsPlayback, setNeedsPlayback] = useState(false);
  const session = useRef<MentorCallSession | null>(null);
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const dialog = useRef<HTMLElement>(null);
  useEffect(() => {
    setState(initial);
    const next = new MentorCallSession(threadId, token, role, setState);
    session.current = next; next.begin();
    return () => { next.dispose(); if (session.current === next) session.current = null; };
  }, [threadId, token, role]);
  useEffect(() => {
    if (localVideo.current) localVideo.current.srcObject = state.local;
    if (remoteVideo.current) {
      remoteVideo.current.srcObject = state.remote;
      if (state.remote) void remoteVideo.current.play().then(() => setNeedsPlayback(false)).catch(() => setNeedsPlayback(true));
    }
  }, [state.local, state.remote, state.call?.id]);
  useEffect(() => {
    if (!state.call?.acceptedAt) { setSeconds(0); return; }
    const start = Date.parse(state.call.acceptedAt);
    const tick = () => setSeconds(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    tick(); const timer = window.setInterval(tick, 1000); return () => clearInterval(timer);
  }, [state.call?.acceptedAt]);
  const call = state.call;
  useEffect(() => {
    if (!call) return;
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    return () => previous?.focus();
  }, [call?.id]);
  useEffect(() => { if (call && !dialog.current?.contains(document.activeElement)) dialog.current?.focus(); }, [call?.status]);
  const active = call?.status === 'ringing' || call?.status === 'accepted';
  const incoming = call?.status === 'ringing' && call.caller !== role;
  const status = call?.status === 'ringing' ? incoming ? 'Incoming call' : 'Calling...'
    : call?.status === 'accepted' ? state.connected ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : 'Connecting...'
    : call?.status === 'declined' ? 'Call declined' : call?.status === 'missed' ? 'Call unanswered'
    : call?.status === 'failed' ? 'Call disconnected' : 'Call ended';
  const button = 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors disabled:opacity-40';
  return <>
    <div className="flex items-center gap-1.5">
      <button type="button" aria-label="Start voice call" title="Voice call" disabled={state.busy || active} onClick={() => session.current?.start('audio')}
        className={`${button} bg-slate-100 text-slate-700 hover:bg-amber-100`}>{state.busy && !call ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}</button>
      <button type="button" aria-label="Start video call" title="Video call" disabled={state.busy || active} onClick={() => session.current?.start('video')}
        className={`${button} bg-slate-100 text-slate-700 hover:bg-amber-100`}><Video className="h-4 w-4" /></button>
    </div>
    {state.error && !call && <p role="alert" className="max-w-xs text-[11px] text-rose-700">{state.error}</p>}
    {call && createPortal(
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-3 sm:p-6">
        <section ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={`mentor-call-${threadId}`}
          onKeyDown={(event) => {
            if (event.key !== 'Tab') return;
            const focusable = dialog.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])');
            if (!focusable?.length) { event.preventDefault(); return; }
            const first = focusable[0], last = focusable[focusable.length - 1];
            if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first.focus(); }
          }}
          className="flex max-h-[95dvh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-neutral-950 text-white shadow-2xl">
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 p-4">
            <div className="min-w-0"><h2 id={`mentor-call-${threadId}`} className="truncate text-base font-semibold">{peerName}</h2>
              <p role="status" className="mt-1 text-xs text-neutral-400">{call.mode === 'video' ? 'Video call' : 'Voice call'} · {status}</p></div>
            {!active && <button type="button" aria-label="Close call" title="Close" onClick={() => session.current?.dismiss()}
              className={`${button} bg-white/10 hover:bg-white/20`}><X className="h-5 w-5" /></button>}
          </header>
          <div className="relative flex min-h-[220px] flex-1 items-center justify-center overflow-hidden bg-black sm:min-h-[360px]">
            <video ref={remoteVideo} autoPlay playsInline className={call.mode === 'video' && state.remote?.getVideoTracks().length ? 'max-h-[60dvh] w-full object-contain' : 'hidden'} />
            {!(call.mode === 'video' && state.remote?.getVideoTracks().length) && <div className="space-y-4 p-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500 text-2xl font-bold text-black">{peerName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('')}</div>
              <p className="text-sm text-neutral-300">{status}</p>
            </div>}
            {call.mode === 'video' && state.local && <video ref={localVideo} autoPlay playsInline muted
              className={`absolute bottom-3 right-3 aspect-video w-28 rounded-lg border border-white/20 bg-neutral-900 object-cover sm:w-40 ${state.cameraOff ? 'invisible' : ''}`} />}
            {needsPlayback && <button type="button" onClick={() => remoteVideo.current?.play().then(() => setNeedsPlayback(false)).catch(() => {})}
              className="absolute left-3 top-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs text-black"><Volume2 className="h-4 w-4" />Tap to hear</button>}
          </div>
          {state.error && <p role="alert" className="px-5 pt-3 text-center text-xs leading-relaxed text-amber-300">{state.error}</p>}
          <footer className="flex shrink-0 flex-wrap items-center justify-center gap-3 p-5">
            {incoming ? <>
              <button type="button" aria-label="Decline call" title="Decline" disabled={state.busy} onClick={() => session.current?.end('declined')}
                className={`${button} bg-rose-600 hover:bg-rose-500`}><PhoneOff className="h-5 w-5" /></button>
              <button type="button" disabled={state.busy} onClick={() => session.current?.accept()}
                className="flex h-11 items-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold hover:bg-emerald-500 disabled:opacity-40">
                {state.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}Accept</button>
              {call.mode === 'video' && <button type="button" disabled={state.busy} onClick={() => session.current?.accept(true)} className="text-xs text-neutral-300 underline">Answer with audio</button>}
            </> : active ? <>
              {state.local && <button type="button" aria-label={state.muted ? 'Unmute microphone' : 'Mute microphone'} title={state.muted ? 'Unmute' : 'Mute'}
                onClick={() => session.current?.toggleMicrophone()} className={`${button} ${state.muted ? 'bg-white text-black' : 'bg-white/10'}`}>
                {state.muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}</button>}
              {state.local?.getVideoTracks().length > 0 && <button type="button" aria-label={state.cameraOff ? 'Turn camera on' : 'Turn camera off'} title={state.cameraOff ? 'Camera on' : 'Camera off'}
                onClick={() => session.current?.toggleCamera()} className={`${button} ${state.cameraOff ? 'bg-white text-black' : 'bg-white/10'}`}>
                {state.cameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}</button>}
              <button type="button" aria-label="End call" title="End call" onClick={() => session.current?.end()}
                className={`${button} bg-rose-600 hover:bg-rose-500`}><PhoneOff className="h-5 w-5" /></button>
            </> : <button type="button" onClick={() => session.current?.dismiss()} className="rounded-lg bg-white/10 px-5 py-2.5 text-sm hover:bg-white/20">Close</button>}
          </footer>
        </section>
      </div>, document.body)}
  </>;
}
