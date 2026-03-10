import { BinanceInterval } from '../binance/types';

export interface Timeframe {
  label: string;
  interval: BinanceInterval;
  wsInterval: string;
  seconds: number;
}

export const TIMEFRAMES: Timeframe[] = [
  { label: '1m',  interval: '1m',  wsInterval: '1m',  seconds: 60 },
  { label: '5m',  interval: '5m',  wsInterval: '5m',  seconds: 300 },
  { label: '15m', interval: '15m', wsInterval: '15m', seconds: 900 },
  { label: '1H',  interval: '1h',  wsInterval: '1h',  seconds: 3600 },
  { label: '4H',  interval: '4h',  wsInterval: '4h',  seconds: 14400 },
  { label: '1D',  interval: '1d',  wsInterval: '1d',  seconds: 86400 },
  { label: '1W',  interval: '1w',  wsInterval: '1w',  seconds: 604800 },
];

export function getTimeframe(interval: BinanceInterval): Timeframe {
  return TIMEFRAMES.find(t => t.interval === interval) ?? TIMEFRAMES[3];
}
