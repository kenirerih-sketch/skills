'use client';

import { useMemo } from 'react';
import { OHLCV } from '@/lib/binance/types';
import { calculateMA, MAPoint } from '@/lib/indicators/ma';
import { calculateEMA, EMAPoint } from '@/lib/indicators/ema';
import { calculateRSI, RSIPoint } from '@/lib/indicators/rsi';
import { calculateMACD, MACDPoint } from '@/lib/indicators/macd';
import { calculateBollinger, BollingerPoint } from '@/lib/indicators/bollinger';
import { IndicatorType } from '@/store/chartStore';

export interface IndicatorData {
  ma20: MAPoint[];
  ma50: MAPoint[];
  ma200: MAPoint[];
  ema12: EMAPoint[];
  ema26: EMAPoint[];
  rsi: RSIPoint[];
  macd: MACDPoint[];
  bollinger: BollingerPoint[];
}

export function useIndicators(data: OHLCV[], activeIndicators: Set<IndicatorType>): IndicatorData {
  return useMemo(() => ({
    ma20: activeIndicators.has('MA20') ? calculateMA(data, 20) : [],
    ma50: activeIndicators.has('MA50') ? calculateMA(data, 50) : [],
    ma200: activeIndicators.has('MA200') ? calculateMA(data, 200) : [],
    ema12: activeIndicators.has('EMA12') ? calculateEMA(data, 12) : [],
    ema26: activeIndicators.has('EMA26') ? calculateEMA(data, 26) : [],
    rsi: activeIndicators.has('RSI') ? calculateRSI(data, 14) : [],
    macd: activeIndicators.has('MACD') ? calculateMACD(data) : [],
    bollinger: activeIndicators.has('BOLL') ? calculateBollinger(data) : [],
  }), [data, activeIndicators]);
}
