import { OHLCV } from '../binance/types';

export interface MACDPoint {
  time: number;
  macd: number;
  signal: number;
  histogram: number;
}

function emaValues(prices: number[], period: number): number[] {
  const result: number[] = [];
  if (prices.length < period) return result;

  const multiplier = 2 / (period + 1);
  let sum = 0;
  for (let i = 0; i < period; i++) sum += prices[i];
  let ema = sum / period;
  // Fill leading positions with NaN
  for (let i = 0; i < period - 1; i++) result.push(NaN);
  result.push(ema);

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
    result.push(ema);
  }
  return result;
}

export function calculateMACD(
  data: OHLCV[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9,
): MACDPoint[] {
  const closes = data.map((d) => d.close);
  const fastEMA = emaValues(closes, fastPeriod);
  const slowEMA = emaValues(closes, slowPeriod);

  // MACD line = fast EMA - slow EMA
  const macdLine: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (isNaN(fastEMA[i]) || isNaN(slowEMA[i])) {
      macdLine.push(NaN);
    } else {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }
  }

  // Signal line = EMA of MACD line (only valid values)
  const validMacd = macdLine.filter((v) => !isNaN(v));
  const signalEma = emaValues(validMacd, signalPeriod);

  const result: MACDPoint[] = [];
  let validIdx = 0;
  for (let i = 0; i < data.length; i++) {
    if (isNaN(macdLine[i])) continue;
    if (validIdx < signalEma.length && !isNaN(signalEma[validIdx])) {
      const hist = macdLine[i] - signalEma[validIdx];
      result.push({
        time: data[i].time,
        macd: macdLine[i],
        signal: signalEma[validIdx],
        histogram: hist,
      });
    }
    validIdx++;
  }

  return result;
}
