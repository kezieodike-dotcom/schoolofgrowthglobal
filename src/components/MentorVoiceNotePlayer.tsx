import React, { useEffect, useRef, useState } from 'react';
import { Play, Loader2, RefreshCw } from 'lucide-react';
import { communicationRequest } from '../lib/mentorCommunications';

export function MentorVoiceNotePlayer({ threadId, messageId, token }: { threadId: string; messageId: string; token: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (url) void audio.current?.play().catch(() => {}); }, [url]);
  const load = async () => {
    if (loading) return;
    setLoading(true); setError('');
    try {
      const result = await communicationRequest<{ url: string }>(`/api/messages/${threadId}/voice/${messageId}/url`, token);
      setUrl(result.url);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not play this voice note.'); }
    finally { setLoading(false); }
  };
  return <div className="w-[230px] max-w-full min-w-0 space-y-1.5">
    {!url && <button type="button" onClick={load} disabled={loading} className="flex items-center gap-2 text-xs font-semibold" aria-label="Play voice note">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : error ? <RefreshCw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      {loading ? 'Opening voice note...' : 'Play voice note'}
    </button>}
    <audio ref={audio} src={url || undefined} controls={Boolean(url)} preload="none" aria-label="Voice note"
      className={url ? 'h-10 w-full max-w-full' : 'hidden'} onError={() => { setUrl(''); setError('Playback link expired. Tap to reload.'); }} />
    {error && <p role="alert" className="text-[11px] leading-relaxed">{error}</p>}
  </div>;
}
