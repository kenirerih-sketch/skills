export type BinanceInterval =
  | '1m' | '3m' | '5m' | '15m' | '30m'
  | '1h' | '2h' | '4h' | '6h' | '8h' | '12h'
  | '1d' | '3d' | '1w' | '1M';

export interface BinanceKlineRaw extends Array<string | number> {
  0: number;   // Open time
  1: string;   // Open
  2: string;   // High
  3: string;   // Low
  4: string;   // Close
  5: string;   // Volume
  6: number;   // Close time
  7: string;   // Quote asset volume
  8: number;   // Number of trades
  9: string;   // Taker buy base asset volume
  10: string;  // Taker buy quote asset volume
  11: string;  // Ignore
}

export interface OHLCV {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Ticker24h {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  lastPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
}

export interface BinanceWsKline {
  t: number;   // Kline start time
  T: number;   // Kline close time
  s: string;   // Symbol
  i: string;   // Interval
  o: string;   // Open
  h: string;   // High
  l: string;   // Low
  c: string;   // Close
  v: string;   // Volume
  x: boolean;  // Is this kline closed?
}

export interface BinanceWsMessage {
  e: string;   // Event type
  E: number;   // Event time
  s: string;   // Symbol
  k: BinanceWsKline;
}
