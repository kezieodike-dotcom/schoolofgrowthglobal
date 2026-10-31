import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Trash2, Send, Loader2 } from 'lucide-react';
import { VOICE_MAX_BYTES, VOICE_MAX_DURATION_MS } from '../lib/mentorCommunications';

export function MentorVoiceNoteComposer({ onSend, disabled = false }: {
  onSend: (audio: Blob, durationMs: number) => Promise<void>; disabled?: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const [starting, setStarting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [preview, setPreview] = useState<{ audio: Blob; url: string; duration: number } | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const live = useRef(true);
  const cancelled = useRef(false);
  const startedAt = useRef(0);

  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false; cancelled.current = true;
      if (recorder.current?.state === 'recording') recorder.current.stop();
      stream.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview.url); }, [preview]);
  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => {
      const duration = Date.now() - startedAt.current;
      setElapsed(Math.min(duration, VOICE_MAX_DURATION_MS));
      if (duration >= VOICE_MAX_DURATION_MS && recorder.current?.state === 'recording') recorder.current.stop();
    }, 250);
    return () => clearInterval(timer);
  }, [recording]);

  const start = async () => {
    if (disabled || starting || recording) return;
    setError(''); setStarting(true);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Voice recording is unavailable in this browser. Try a recent browser over a secure connection.'); setStarting(false); return;
    }
    try {
      const audio = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!live.current) { audio.getTracks().forEach((track) => track.stop()); return; }
      stream.current = audio;
      const mimeType = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4'].find((type) => MediaRecorder.isTypeSupported(type));
      const current = new MediaRecorder(audio, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 64000 });
      recorder.current = current; cancelled.current = false;
      const chunks: Blob[] = []; let total = 0;
      current.ondataavailable = (event) => {
        if (event.data.size) { chunks.push(event.data); total += event.data.size; }
        if (total > VOICE_MAX_BYTES && current.state === 'recording') {
          cancelled.current = true; current.stop();
          if (live.current) setError('This recording is too large. Please record a shorter voice note.');
        }
      };
      current.onstop = () => {
        audio.getTracks().forEach((track) => track.stop());
        if (!live.current) return;
        setRecording(false);
        if (!cancelled.current) {
          const blob = new Blob(chunks, { type: current.mimeType || mimeType || 'audio/webm' });
          if (blob.size && blob.size <= VOICE_MAX_BYTES) setPreview({ audio: blob, url: URL.createObjectURL(blob),
            duration: Math.max(1, Math.min(VOICE_MAX_DURATION_MS, Date.now() - startedAt.current)) });
          else setError('The recording could not be saved. Please record a shorter voice note.');
        }
      };
      current.onerror = () => {
        cancelled.current = true; audio.getTracks().forEach((track) => track.stop());
        if (live.current) { setRecording(false); setError('Recording stopped unexpectedly. Please try again.'); }
      };
      startedAt.current = Date.now(); setElapsed(0); current.start(500); setRecording(true);
    } catch (failure) {
      stream.current?.getTracks().forEach((track) => track.stop());
      if (live.current) setError(failure instanceof DOMException && failure.name === 'NotAllowedError'
        ? 'Microphone access was denied. Allow microphone access in your browser to record.' : 'We could not access your microphone.');
    } finally { if (live.current) setStarting(false); }
  };
  const discard = () => {
    cancelled.current = true;
    if (recorder.current?.state === 'recording') recorder.current.stop();
    stream.current?.getTracks().forEach((track) => track.stop());
    setRecording(false); setPreview(null); setError('');
  };
  const send = async () => {
    if (!preview || sending) return;
    setSending(true); setError('');
    try { await onSend(preview.audio, preview.duration); if (live.current) setPreview(null); }
    catch (failure) { if (live.current) setError(failure instanceof Error ? failure.message : 'The voice note could not be sent.'); }
    finally { if (live.current) setSending(false); }
  };
  return (
    <div className="min-w-0 space-y-2">
      <div className="flex min-w-0 items-center gap-2">
        {!recording && !preview && <button type="button" title="Record voice note" aria-label="Record voice note" onClick={start}
          disabled={disabled || starting} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-amber-100 disabled:opacity-40">
          {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
        </button>}
        {recording && <>
          <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" />
          <span role="timer" className="font-mono text-xs text-slate-600">{Math.floor(elapsed / 60000)}:{String(Math.floor(elapsed / 1000) % 60).padStart(2, '0')}</span>
          <button type="button" title="Stop recording" aria-label="Stop recording" onClick={() => recorder.current?.stop()}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-700"><Square className="h-4 w-4" /></button>
        </>}
        {preview && <audio src={preview.url} controls preload="metadata" aria-label="Preview voice note" className="h-10 min-w-0 flex-1 max-w-full" />}
        {(recording || preview) && <button type="button" title="Discard voice note" aria-label="Discard voice note" disabled={sending} onClick={discard}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>}
        {preview && <button type="button" title="Send voice note" aria-label="Send voice note" onClick={send} disabled={sending || disabled}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-slate-950 disabled:opacity-40">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>}
        {sending && <span role="status" className="text-xs text-slate-500">Sending...</span>}
      </div>
      {error && <p role="alert" className="text-xs leading-relaxed text-rose-700">{error}</p>}
    </div>
  );
}
