import { create } from 'zustand';
import { BinanceInterval } from '@/lib/binance/types';

export type Symbol = 'BTCUSDT' | 'ETHUSDT';
export type IndicatorType = 'MA20' | 'MA50' | 'MA200' | 'EMA12' | 'EMA26' | 'RSI' | 'MACD' | 'BOLL';

export interface Drawing {
  id: string;
  tool: 'trendline' | 'horizontal' | 'fibonacci' | 'rectangle';
  points: { time: number; price: number }[];
  color: string;
  symbol: Symbol;
  interval: BinanceInterval;
}

interface ChartState {
  symbol: Symbol;
  interval: BinanceInterval;
  indicators: Set<IndicatorType>;
  drawings: Drawing[];
  activeTool: string | null;

  setSymbol: (s: Symbol) => void;
  setInterval: (i: BinanceInterval) => void;
  toggleIndicator: (ind: IndicatorType) => void;
  setActiveTool: (tool: string | null) => void;
  addDrawing: (d: Drawing) => void;
  removeDrawing: (id: string) => void;
  clearDrawings: () => void;
}

export const useChartStore = create<ChartState>((set) => ({
  symbol: 'BTCUSDT',
  interval: '1h',
  indicators: new Set<IndicatorType>(),
  drawings: [],
  activeTool: null,

  setSymbol: (symbol) => set({ symbol }),
  setInterval: (interval) => set({ interval }),
  toggleIndicator: (ind) =>
    set((state) => {
      const next = new Set(state.indicators);
      if (next.has(ind)) next.delete(ind);
      else next.add(ind);
      return { indicators: next };
    }),
  setActiveTool: (activeTool) => set({ activeTool }),
  addDrawing: (d) => set((state) => ({ drawings: [...state.drawings, d] })),
  removeDrawing: (id) =>
    set((state) => ({ drawings: state.drawings.filter((d) => d.id !== id) })),
  clearDrawings: () => set({ drawings: [] }),
}));
