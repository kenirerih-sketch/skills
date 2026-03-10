import { OHLCV } from '../binance/types';

export interface BollingerPoint {
  time: number;
  upper: number;
  middle: number;
  lower: number;
}

export function calculateBollinger(
  data: OHLCV[],
  period: number = 20,
  stdDev: number = 2,
): BollingerPoint[] {
  const result: BollingerPoint[] = [];
  if (data.length < period) return result;

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close;
    }
    const middle = sum / period;

    let sqSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sqSum += (data[j].close - middle) ** 2;
    }
    const sd = Math.sqrt(sqSum / period);

    result.push({
      time: data[i].time,
      upper: middle + stdDev * sd,
      middle,
      lower: middle - stdDev * sd,
    });
  }

  return result;
}
