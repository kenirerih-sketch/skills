import { OHLCV, BinanceWsKline } from './types';

export function mapBinanceKline(raw: unknown[]): OHLCV {
  return {
    time: Math.floor((raw[0] as number) / 1000),
    open: parseFloat(raw[1] as string),
    high: parseFloat(raw[2] as string),
    low: parseFloat(raw[3] as string),
    close: parseFloat(raw[4] as string),
    volume: parseFloat(raw[5] as string),
  };
}

export function mapBinanceKlines(rawKlines: unknown[][]): OHLCV[] {
  return rawKlines.map(mapBinanceKline);
}

export function mapWsKline(k: BinanceWsKline): OHLCV {
  return {
    time: Math.floor(k.t / 1000),
    open: parseFloat(k.o),
    high: parseFloat(k.h),
    low: parseFloat(k.l),
    close: parseFloat(k.c),
    volume: parseFloat(k.v),
  };
}
