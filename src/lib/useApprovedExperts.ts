import { useEffect, useState } from 'react';
import type { ApprovedExpert } from './leadershipBoard';
import { isSuspendedPublicProfile, normalizePublicProfile } from './publicProfiles';

export function useApprovedExperts() {
  const [experts, setExperts] = useState<ApprovedExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let live = true;
    let controller: AbortController | undefined;
    const refresh = async () => {
      controller?.abort();
      controller = new AbortController();
      const signal = controller.signal;
      try {
        const response = await fetch('/api/mentors/directory', { signal });
        if (!response.ok) throw new Error('Approved profiles could not be loaded.');
        const body = await response.json();
        if (!Array.isArray(body.mentors)) throw new Error('Approved profiles could not be loaded.');
        const next = (body.mentors as ApprovedExpert[]).filter(expert =>
          typeof expert.id === 'string' && typeof expert.name === 'string' && typeof expert.role === 'string' &&
          Array.isArray(expert.expertise) && (expert.applicationType === 'mentor' || expert.applicationType === 'consultant') &&
          !isSuspendedPublicProfile(expert)
        ).map(expert => normalizePublicProfile({ ...expert, avatar: expert.avatar ?? '' }));
        if (live && !signal.aborted) { setExperts(next); setError(null); }
      } catch {
        if (live && !signal.aborted) { setExperts([]); setError('Approved profiles could not be loaded.'); }
      } finally {
        if (live && !signal.aborted) setLoading(false);
      }
    };
    void refresh();
    const onFocus = () => { if (document.visibilityState === 'visible') void refresh(); };
    const interval = window.setInterval(onFocus, 60000);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      live = false;
      controller?.abort();
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [revision]);

  return { experts, loading, error, retry: () => { setLoading(true); setRevision(value => value + 1); } };
}
