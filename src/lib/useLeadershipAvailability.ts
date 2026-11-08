import { useEffect, useState } from 'react';
import type { LeadershipAvailability, LeadershipOutlines } from '../data/leadershipPricing';

export function useLeadershipAvailability(enabled = true) {
  const [available, setAvailable] = useState<LeadershipAvailability>({});
  const [outlines, setOutlines] = useState<LeadershipOutlines>({});
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetch('/api/lms/leadership/availability', { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('Availability unavailable');
        const body = await response.json();
        if (!body.available || typeof body.available !== 'object' || Array.isArray(body.available)) throw new Error('Invalid availability');
        if (!controller.signal.aborted) {
          setAvailable(body.available);
          setOutlines(body.outlines ?? {});
        }
      })
      .catch(() => { if (!controller.signal.aborted) { setError(true); setAvailable({}); setOutlines({}); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [enabled]);
  return { available, outlines, loading, error };
}
