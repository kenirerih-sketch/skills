import { NextRequest, NextResponse } from 'next/server';
import { fetchTicker24h } from '@/lib/binance/client';

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol') ?? 'BTCUSDT';

  try {
    const ticker = await fetchTicker24h(symbol);
    return NextResponse.json(ticker);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
