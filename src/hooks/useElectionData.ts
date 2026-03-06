import { useEffect, useMemo, useRef, useState } from 'react';
import { csvEndpoints, refreshIntervalMs } from '../config';
import { loadDashboardData } from '../data/api';
import { DashboardData } from '../types';

export interface UseElectionDataState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useElectionData(): UseElectionDataState {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastGoodDataRef = useRef<DashboardData | null>(null);

  const endpoints = useMemo(() => csvEndpoints, []);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const nextData = await loadDashboardData(endpoints, controller.signal);
        if (!mounted) {
          return;
        }
        lastGoodDataRef.current = nextData;
        setData(nextData);
        setError(null);
        setLastUpdated(new Date());
      } catch (err) {
        if (!mounted || controller.signal.aborted) {
          return;
        }

        const message = err instanceof Error ? err.message : 'Failed to load election data.';
        setError(message);
        if (lastGoodDataRef.current) {
          setData(lastGoodDataRef.current);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchData();
    const interval = window.setInterval(() => {
      void fetchData();
    }, refreshIntervalMs);

    return () => {
      mounted = false;
      window.clearInterval(interval);
      abortRef.current?.abort();
    };
  }, [endpoints]);

  return { data, isLoading, error, lastUpdated };
}
