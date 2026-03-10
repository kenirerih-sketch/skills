'use client';

import { useCallback, useEffect, useState } from 'react';
import { OHLCV, BinanceInterval } from '@/lib/binance/types';

export function useBinanceKlines(symbol: string, interval: BinanceInterval) {
  const [data, setData] = useState<OHLCV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/binance/klines?symbol=${symbol}&interval=${interval}&limit=500`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const klines: OHLCV[] = await res.json();
      setData(klines);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch klines');
    } finally {
      setLoading(false);
    }
  }, [symbol, interval]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
