import { NextRequest, NextResponse } from 'next/server';
import { fetchKlines } from '@/lib/binance/client';
import { BinanceInterval } from '@/lib/binance/types';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const symbol = searchParams.get('symbol') ?? 'BTCUSDT';
  const interval = (searchParams.get('interval') ?? '1h') as BinanceInterval;
  const limit = parseInt(searchParams.get('limit') ?? '500', 10);
  const endTime = searchParams.get('endTime')
    ? parseInt(searchParams.get('endTime')!, 10)
    : undefined;

  try {
    const klines = await fetchKlines(symbol, interval, limit, endTime);
    return NextResponse.json(klines);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
