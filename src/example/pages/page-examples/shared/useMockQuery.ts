// Minimal stand-in for @tanstack/react-query's useQuery — enough for our example.
// The real consumer code uses TanStack; we mimic the surface so the example
// pages read like the real thing (`isFetching`, `data`, `refetch`).

import { useEffect, useState, useRef } from 'react';

export interface QueryResult<T> {
  data: T | undefined;
  isFetching: boolean;
  refetch: () => void;
}

export function useMockQuery<T>(
  key: ReadonlyArray<unknown>,
  fn: () => Promise<T>,
  options?: { enabled?: boolean; keepPreviousData?: boolean },
): QueryResult<T> {
  const enabled = options?.enabled ?? true;
  const keepPrev = options?.keepPreviousData ?? false;
  const [data, setData] = useState<T | undefined>(undefined);
  const [isFetching, setIsFetching] = useState(false);
  const [tick, setTick] = useState(0);
  const reqId = useRef(0);
  const serialKey = JSON.stringify(key);

  useEffect(() => {
    if (!enabled) return;
    const my = ++reqId.current;
    setIsFetching(true);
    if (!keepPrev) setData(undefined);
    fn()
      .then((res) => {
        if (my !== reqId.current) return;
        setData(res);
      })
      .catch(() => {
        if (my !== reqId.current) return;
        setData(undefined);
      })
      .finally(() => {
        if (my !== reqId.current) return;
        setIsFetching(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialKey, enabled, tick]);

  return { data, isFetching, refetch: () => setTick((t) => t + 1) };
}
