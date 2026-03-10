'use client';

import { useEffect, useState } from 'react';
import { useChartStore } from '@/store/chartStore';
import { Ticker24h } from '@/lib/binance/types';
import { formatPrice, formatVolume, formatPercentChange } from '@/lib/chart/formatters';

export default function ChartHeader() {
  const { symbol } = useChartStore();
  const [ticker, setTicker] = useState<Ticker24h | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/binance/ticker?symbol=${symbol}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setTicker(data);
      } catch {
        // ignore
      }
    }
    load();
    const id = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [symbol]);

  if (!ticker) return null;

  const price = parseFloat(ticker.lastPrice);
  const changePct = parseFloat(ticker.priceChangePercent);
  const isUp = changePct >= 0;

  return (
    <div className="flex items-center gap-6 px-4 py-2 text-sm">
      <div>
        <span className="text-xl font-bold text-white">
          {formatPrice(price, symbol)}
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <div>
          <span className="text-gray-500">24h Change </span>
          <span className={isUp ? 'text-green-400' : 'text-red-400'}>
            {formatPercentChange(changePct)}
          </span>
        </div>
        <div>
          <span className="text-gray-500">24h High </span>
          <span className="text-gray-300">{formatPrice(parseFloat(ticker.highPrice), symbol)}</span>
        </div>
        <div>
          <span className="text-gray-500">24h Low </span>
          <span className="text-gray-300">{formatPrice(parseFloat(ticker.lowPrice), symbol)}</span>
        </div>
        <div>
          <span className="text-gray-500">24h Vol </span>
          <span className="text-gray-300">{formatVolume(parseFloat(ticker.quoteVolume))}</span>
        </div>
      </div>
    </div>
  );
}
