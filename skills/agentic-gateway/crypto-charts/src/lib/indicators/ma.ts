import { OHLCV } from '../binance/types';

export interface MAPoint {
  time: number;
  value: number;
}

export function calculateMA(data: OHLCV[], period: number): MAPoint[] {
  const result: MAPoint[] = [];
  if (data.length < period) return result;

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  result.push({ time: data[period - 1].time, value: sum / period });

  for (let i = period; i < data.length; i++) {
    sum += data[i].close - data[i - period].close;
    result.push({ time: data[i].time, value: sum / period });
  }

  return result;
}
