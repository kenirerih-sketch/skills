'use client';

import { useEffect, useRef } from 'react';
import {
  createChart,
  IChartApi,
  LineSeries,
  HistogramSeries,
  Time,
  DeepPartial,
  ChartOptions,
} from 'lightweight-charts';
import { CHART_OPTIONS, CHART_COLORS } from '@/lib/chart/config';
import { RSIPoint } from '@/lib/indicators/rsi';
import { MACDPoint } from '@/lib/indicators/macd';

interface RSIProps {
  type: 'RSI';
  data: RSIPoint[];
  mainChart: IChartApi | null;
}

interface MACDProps {
  type: 'MACD';
  data: MACDPoint[];
  mainChart: IChartApi | null;
}

type Props = RSIProps | MACDProps;

const SUB_CHART_OPTIONS: DeepPartial<ChartOptions> = {
  ...CHART_OPTIONS,
  rightPriceScale: {
    borderColor: CHART_COLORS.border,
    scaleMargins: { top: 0.1, bottom: 0.1 },
  },
};

export default function SubChart(props: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // Create chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      ...SUB_CHART_OPTIONS,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    chartRef.current = chart;

    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  // Set data
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    // Remove all existing series by recreating
    // lightweight-charts doesn't have a removeAllSeries, so we track them
    // Simple approach: remove and recreate chart is overkill, instead we'll just add new series each time
    // and the chart handles it.

    // Actually we need to be smarter - remove old series
    // For simplicity, let's remove the chart and recreate
    if (!containerRef.current) return;

    // Clear chart series
    const existingSeries = chart.getSeries?.();
    // fallback: just set data

    if (props.type === 'RSI') {
      // Add RSI line
      const rsiLine = chart.addSeries(LineSeries, {
        color: CHART_COLORS.rsi,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: true,
      });
      rsiLine.setData(props.data.map(d => ({ time: d.time as Time, value: d.value })));

      // Add overbought/oversold lines
      if (props.data.length > 0) {
        const overbought = chart.addSeries(LineSeries, {
          color: CHART_COLORS.rsiOverbought,
          lineWidth: 1,
          lineStyle: 2,
          priceLineVisible: false,
          lastValueVisible: false,
        });
        overbought.setData(props.data.map(d => ({ time: d.time as Time, value: 70 })));

        const oversold = chart.addSeries(LineSeries, {
          color: CHART_COLORS.rsiOversold,
          lineWidth: 1,
          lineStyle: 2,
          priceLineVisible: false,
          lastValueVisible: false,
        });
        oversold.setData(props.data.map(d => ({ time: d.time as Time, value: 30 })));
      }

      chart.timeScale().fitContent();

      return () => {
        try {
          chart.removeSeries(rsiLine);
        } catch { /* ok */ }
      };
    }

    if (props.type === 'MACD') {
      const macdLine = chart.addSeries(LineSeries, {
        color: CHART_COLORS.macdLine,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      macdLine.setData(props.data.map(d => ({ time: d.time as Time, value: d.macd })));

      const signalLine = chart.addSeries(LineSeries, {
        color: CHART_COLORS.macdSignal,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      signalLine.setData(props.data.map(d => ({ time: d.time as Time, value: d.signal })));

      const histogram = chart.addSeries(HistogramSeries, {
        priceLineVisible: false,
        lastValueVisible: false,
      });
      histogram.setData(
        props.data.map(d => ({
          time: d.time as Time,
          value: d.histogram,
          color: d.histogram >= 0 ? CHART_COLORS.macdHistUp : CHART_COLORS.macdHistDown,
        })),
      );

      chart.timeScale().fitContent();

      return () => {
        try {
          chart.removeSeries(macdLine);
          chart.removeSeries(signalLine);
          chart.removeSeries(histogram);
        } catch { /* ok */ }
      };
    }
  }, [props.type, props.data]);

  // Sync time scale with main chart
  useEffect(() => {
    const chart = chartRef.current;
    const mainChart = props.mainChart;
    if (!chart || !mainChart) return;

    const handler = () => {
      const range = mainChart.timeScale().getVisibleLogicalRange();
      if (range) {
        chart.timeScale().setVisibleLogicalRange(range);
      }
    };

    const sub = mainChart.timeScale().subscribeVisibleLogicalRangeChange(handler);
    return () => {
      sub();
    };
  }, [props.mainChart]);

  const label = props.type === 'RSI' ? 'RSI (14)' : 'MACD (12, 26, 9)';

  return (
    <div className="relative border-t border-[#1e1e30]" style={{ height: 150 }}>
      <div className="absolute top-1 left-2 z-10 text-xs text-gray-500">{label}</div>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
