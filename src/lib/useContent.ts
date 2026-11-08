import { useEffect, useMemo, useState } from 'react';
import {
  mergeContent,
  type ContentKind,
  type ContentPayloadMap,
  type ContentRecord,
} from './content';

interface ContentState<K extends ContentKind> {
  items: ContentPayloadMap[K][];
  records: ContentRecord<K>[];
  loading: boolean;
  error: string | null;
}

export function useContentCollection<K extends ContentKind>(
  kind: K,
  seed: ContentPayloadMap[K][]
): ContentState<K> {
  const [records, setRecords] = useState<ContentRecord<K>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(null);

    fetch(`/api/content/${kind}`)
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(body?.error ?? `Could not load ${kind} content.`);
        }
        return (body?.records ?? []) as ContentRecord<K>[];
      })
      .then((next) => {
        if (live) setRecords(next);
      })
      .catch((err) => {
        if (live) setError(err instanceof Error ? err.message : 'Could not load content.');
      })
      .finally(() => {
        if (live) setLoading(false);
      });

    return () => {
      live = false;
    };
  }, [kind]);

  const items = useMemo(
    () => mergeContent(seed, records as ContentRecord[]),
    [records, seed]
  ) as ContentPayloadMap[K][];

  return { items, records, loading, error };
}
