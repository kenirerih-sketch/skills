'use client';

import { useEffect, useRef } from 'react';
import { useChart } from '@/hooks/useChart';
import { useBinanceKlines } from '@/hooks/useBinanceKlines';
import { useChartStore } from '@/store/chartStore';
import { CHART_COLORS } from '@/lib/chart/config';
import { CandlestickData, HistogramData, Time } from 'lightweight-charts';

export default function ChartContainer() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { symbol, interval } = useChartStore();
  const { data, loading } = useBinanceKlines(symbol, interval);
  const { chartRef, candleSeriesRef, volumeSeriesRef } = useChart(containerRef);

  // Update chart data when klines change
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || data.length === 0) return;

    const candles: CandlestickData<Time>[] = data.map((k) => ({
      time: k.time as Time,
      open: k.open,
      high: k.high,
      low: k.low,
      close: k.close,
    }));

    const volumes: HistogramData<Time>[] = data.map((k) => ({
      time: k.time as Time,
      value: k.volume,
      color: k.close >= k.open ? CHART_COLORS.volumeUp : CHART_COLORS.volumeDown,
    }));

    candleSeriesRef.current.setData(candles);
    volumeSeriesRef.current.setData(volumes);

    // Fit content on initial load
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [data, candleSeriesRef, volumeSeriesRef, chartRef]);

  return (
    <div className="relative flex-1 min-h-0">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#0a0a0f]/80">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            Loading chart data...
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
