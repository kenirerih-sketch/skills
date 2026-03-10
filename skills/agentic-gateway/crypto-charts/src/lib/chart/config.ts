import { DeepPartial, ChartOptions, CandlestickStyleOptions, SeriesOptionsCommon } from 'lightweight-charts';

export const CHART_COLORS = {
  background: '#0a0a0f',
  text: '#d1d5db',
  textSecondary: '#6b7280',
  grid: '#1a1a2e',
  border: '#1a1a2e',
  upColor: '#22c55e',
  downColor: '#ef4444',
  upWick: '#22c55e',
  downWick: '#ef4444',
  volumeUp: 'rgba(34, 197, 94, 0.3)',
  volumeDown: 'rgba(239, 68, 68, 0.3)',
  crosshair: '#6366f1',
  ma20: '#f59e0b',
  ma50: '#3b82f6',
  ma200: '#8b5cf6',
  ema12: '#06b6d4',
  ema26: '#ec4899',
  bollingerUpper: '#6366f1',
  bollingerLower: '#6366f1',
  bollingerMiddle: '#6366f1',
  rsi: '#f59e0b',
  rsiOverbought: 'rgba(239, 68, 68, 0.3)',
  rsiOversold: 'rgba(34, 197, 94, 0.3)',
  macdLine: '#3b82f6',
  macdSignal: '#ef4444',
  macdHistUp: 'rgba(34, 197, 94, 0.5)',
  macdHistDown: 'rgba(239, 68, 68, 0.5)',
};

export const CHART_OPTIONS: DeepPartial<ChartOptions> = {
  layout: {
    background: { color: CHART_COLORS.background },
    textColor: CHART_COLORS.text,
    fontSize: 12,
  },
  grid: {
    vertLines: { color: CHART_COLORS.grid },
    horzLines: { color: CHART_COLORS.grid },
  },
  crosshair: {
    mode: 0, // Normal
    vertLine: { color: CHART_COLORS.crosshair, width: 1, style: 2 },
    horzLine: { color: CHART_COLORS.crosshair, width: 1, style: 2 },
  },
  rightPriceScale: {
    borderColor: CHART_COLORS.border,
    scaleMargins: { top: 0.1, bottom: 0.2 },
  },
  timeScale: {
    borderColor: CHART_COLORS.border,
    timeVisible: true,
    secondsVisible: false,
  },
};

export const CANDLESTICK_OPTIONS: DeepPartial<CandlestickStyleOptions & SeriesOptionsCommon> = {
  upColor: CHART_COLORS.upColor,
  downColor: CHART_COLORS.downColor,
  wickUpColor: CHART_COLORS.upWick,
  wickDownColor: CHART_COLORS.downWick,
  borderVisible: false,
};
