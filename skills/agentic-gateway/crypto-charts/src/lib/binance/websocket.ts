import { BinanceWsMessage } from './types';
import { mapWsKline } from './mappers';
import { OHLCV } from './types';

type CandleHandler = (candle: OHLCV, isClosed: boolean) => void;

export class BinanceWebSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private symbol: string;
  private interval: string;
  private onCandle: CandleHandler;
  private onStatusChange: (connected: boolean) => void;
  private destroyed = false;

  constructor(
    symbol: string,
    interval: string,
    onCandle: CandleHandler,
    onStatusChange: (connected: boolean) => void,
  ) {
    this.symbol = symbol.toLowerCase();
    this.interval = interval;
    this.onCandle = onCandle;
    this.onStatusChange = onStatusChange;
  }

  connect() {
    if (this.destroyed) return;
    this.cleanup();

    const url = `wss://stream.binance.com:9443/ws/${this.symbol}@kline_${this.interval}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.onStatusChange(true);
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: BinanceWsMessage = JSON.parse(event.data);
        if (msg.e === 'kline') {
          const candle = mapWsKline(msg.k);
          this.onCandle(candle, msg.k.x);
        }
      } catch {
        // ignore parse errors
      }
    };

    this.ws.onclose = () => {
      this.onStatusChange(false);
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private scheduleReconnect() {
    if (this.destroyed) return;
    this.reconnectTimer = setTimeout(() => this.connect(), 3000);
  }

  private cleanup() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws = null;
    }
  }

  destroy() {
    this.destroyed = true;
    this.cleanup();
    this.onStatusChange(false);
  }
}
