import { BinanceInterval, Ticker24h } from './types';
import { OHLCV } from './types';
import { mapBinanceKlines } from './mappers';

const BINANCE_BASE = 'https://api.binance.com';

export async function fetchKlines(
  symbol: string,
  interval: BinanceInterval,
  limit: number = 500,
  endTime?: number,
): Promise<OHLCV[]> {
  const params = new URLSearchParams({
    symbol: symbol.toUpperCase(),
    interval,
    limit: String(limit),
  });
  if (endTime) params.set('endTime', String(endTime));

  const res = await fetch(`${BINANCE_BASE}/api/v3/klines?${params}`);
  if (!res.ok) throw new Error(`Binance klines error: ${res.status}`);
  const raw = await res.json();
  return mapBinanceKlines(raw);
}

export async function fetchTicker24h(symbol: string): Promise<Ticker24h> {
  const res = await fetch(
    `${BINANCE_BASE}/api/v3/ticker/24hr?symbol=${symbol.toUpperCase()}`
  );
  if (!res.ok) throw new Error(`Binance ticker error: ${res.status}`);
  return res.json();
}
