import { create } from 'zustand';
import { OHLCV } from '@/lib/binance/types';

interface WebSocketState {
  connected: boolean;
  lastCandle: OHLCV | null;
  setConnected: (v: boolean) => void;
  setLastCandle: (c: OHLCV) => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  connected: false,
  lastCandle: null,
  setConnected: (connected) => set({ connected }),
  setLastCandle: (lastCandle) => set({ lastCandle }),
}));
