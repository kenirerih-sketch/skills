import { OHLCV } from '../binance/types';

export interface EMAPoint {
  time: number;
  value: number;
}

export function calculateEMA(data: OHLCV[], period: number): EMAPoint[] {
  const result: EMAPoint[] = [];
  if (data.length < period) return result;

  const multiplier = 2 / (period + 1);

  // First EMA = SMA of first `period` values
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  let ema = sum / period;
  result.push({ time: data[period - 1].time, value: ema });

  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema;
    result.push({ time: data[i].time, value: ema });
  }

  return result;
}
