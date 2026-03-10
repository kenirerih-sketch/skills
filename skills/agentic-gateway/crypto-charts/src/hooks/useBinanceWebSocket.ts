'use client';

import { useEffect, useRef, useCallback } from 'react';
import { BinanceWebSocket } from '@/lib/binance/websocket';
import { OHLCV } from '@/lib/binance/types';
import { useWebSocketStore } from '@/store/websocketStore';
import { ISeriesApi, CandlestickData, HistogramData, Time } from 'lightweight-charts';
import { CHART_COLORS } from '@/lib/chart/config';

export function useBinanceWebSocket(
  symbol: string,
  interval: string,
  candleSeries: ISeriesApi<'Candlestick'> | null,
  volumeSeries: ISeriesApi<'Histogram'> | null,
) {
  const wsRef = useRef<BinanceWebSocket | null>(null);
  const { setConnected, setLastCandle } = useWebSocketStore();

  const handleCandle = useCallback(
    (candle: OHLCV, _isClosed: boolean) => {
      setLastCandle(candle);

      if (candleSeries) {
        const candleData: CandlestickData<Time> = {
          time: candle.time as Time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        };
        candleSeries.update(candleData);
      }

      if (volumeSeries) {
        const volData: HistogramData<Time> = {
          time: candle.time as Time,
          value: candle.volume,
          color: candle.close >= candle.open ? CHART_COLORS.volumeUp : CHART_COLORS.volumeDown,
        };
        volumeSeries.update(volData);
      }
    },
    [candleSeries, volumeSeries, setLastCandle],
  );

  useEffect(() => {
    if (!candleSeries || !volumeSeries) return;

    wsRef.current = new BinanceWebSocket(
      symbol,
      interval,
      handleCandle,
      setConnected,
    );
    wsRef.current.connect();

    return () => {
      wsRef.current?.destroy();
      wsRef.current = null;
    };
  }, [symbol, interval, candleSeries, volumeSeries, handleCandle, setConnected]);
}
