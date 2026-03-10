'use client';

import { useChartStore, Symbol } from '@/store/chartStore';

const SYMBOLS: { value: Symbol; label: string; icon: string }[] = [
  { value: 'BTCUSDT', label: 'BTC/USDT', icon: '₿' },
  { value: 'ETHUSDT', label: 'ETH/USDT', icon: 'Ξ' },
];

export default function SymbolSelector() {
  const { symbol, setSymbol } = useChartStore();

  return (
    <div className="flex items-center gap-1">
      {SYMBOLS.map((s) => (
        <button
          key={s.value}
          onClick={() => setSymbol(s.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
            symbol === s.value
              ? 'bg-white/10 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="text-base">{s.icon}</span>
          {s.label}
        </button>
      ))}
    </div>
  );
}
