'use client';

import { useEffect, useRef } from 'react';
import { IChartApi, ISeriesApi, LineSeries, Time } from 'lightweight-charts';
import { IndicatorData } from '@/hooks/useIndicators';
import { CHART_COLORS } from '@/lib/chart/config';
import { IndicatorType } from '@/store/chartStore';

interface Props {
  chart: IChartApi | null;
  indicators: IndicatorData;
  activeIndicators: Set<IndicatorType>;
}

interface SeriesMap {
  [key: string]: ISeriesApi<'Line'>;
}

export default function IndicatorOverlay({ chart, indicators, activeIndicators }: Props) {
  const seriesMapRef = useRef<SeriesMap>({});

  useEffect(() => {
    if (!chart) return;

    const seriesMap = seriesMapRef.current;

    // Helper to add or update a line series
    const upsert = (key: string, data: { time: number; value: number }[], color: string, width: number = 1) => {
      if (data.length === 0) {
        if (seriesMap[key]) {
          chart.removeSeries(seriesMap[key]);
          delete seriesMap[key];
        }
        return;
      }
      if (!seriesMap[key]) {
        seriesMap[key] = chart.addSeries(LineSeries, {
          color,
          lineWidth: width,
          priceScaleId: 'right',
          lastValueVisible: false,
          priceLineVisible: false,
        });
      }
      seriesMap[key].setData(data.map(d => ({ time: d.time as Time, value: d.value })));
    };

    // MA overlays
    upsert('ma20', indicators.ma20, CHART_COLORS.ma20);
    upsert('ma50', indicators.ma50, CHART_COLORS.ma50);
    upsert('ma200', indicators.ma200, CHART_COLORS.ma200);
    upsert('ema12', indicators.ema12, CHART_COLORS.ema12);
    upsert('ema26', indicators.ema26, CHART_COLORS.ema26);

    // Bollinger Bands
    upsert('bollUpper', indicators.bollinger.map(b => ({ time: b.time, value: b.upper })), CHART_COLORS.bollingerUpper);
    upsert('bollMiddle', indicators.bollinger.map(b => ({ time: b.time, value: b.middle })), CHART_COLORS.bollingerMiddle);
    upsert('bollLower', indicators.bollinger.map(b => ({ time: b.time, value: b.lower })), CHART_COLORS.bollingerLower);

    // Clean up removed indicators
    const activeKeys = new Set<string>();
    if (activeIndicators.has('MA20')) activeKeys.add('ma20');
    if (activeIndicators.has('MA50')) activeKeys.add('ma50');
    if (activeIndicators.has('MA200')) activeKeys.add('ma200');
    if (activeIndicators.has('EMA12')) activeKeys.add('ema12');
    if (activeIndicators.has('EMA26')) activeKeys.add('ema26');
    if (activeIndicators.has('BOLL')) {
      activeKeys.add('bollUpper');
      activeKeys.add('bollMiddle');
      activeKeys.add('bollLower');
    }

    for (const key of Object.keys(seriesMap)) {
      if (!activeKeys.has(key)) {
        chart.removeSeries(seriesMap[key]);
        delete seriesMap[key];
      }
    }
  }, [chart, indicators, activeIndicators]);

  // Cleanup all series on unmount
  useEffect(() => {
    return () => {
      if (!chart) return;
      const seriesMap = seriesMapRef.current;
      for (const key of Object.keys(seriesMap)) {
        try { chart.removeSeries(seriesMap[key]); } catch { /* chart may already be removed */ }
        delete seriesMap[key];
      }
    };
  }, [chart]);

  return null;
}
