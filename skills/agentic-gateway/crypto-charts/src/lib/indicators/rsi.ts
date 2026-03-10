import { OHLCV } from '../binance/types';

export interface RSIPoint {
  time: number;
  value: number;
}

export function calculateRSI(data: OHLCV[], period: number = 14): RSIPoint[] {
  const result: RSIPoint[] = [];
  if (data.length < period + 1) return result;

  let avgGain = 0;
  let avgLoss = 0;

  // Initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change >= 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }
  avgGain /= period;
  avgLoss /= period;

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);
  result.push({ time: data[period].time, value: rsi });

  // Subsequent values use smoothed averages
  for (let i = period + 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    const gain = change >= 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const currentRs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const currentRsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + currentRs);
    result.push({ time: data[i].time, value: currentRsi });
  }

  return result;
}
