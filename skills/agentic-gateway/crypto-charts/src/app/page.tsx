'use client';

import dynamic from 'next/dynamic';
import SymbolSelector from '@/components/chart/SymbolSelector';
import TimeframeSelector from '@/components/chart/TimeframeSelector';
import ChartHeader from '@/components/chart/ChartHeader';

const ChartContainer = dynamic(() => import('@/components/chart/ChartContainer'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#0a0a0f]">
      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-[#1e1e30]">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-white tracking-tight">CryptoCharts</h1>
          <SymbolSelector />
          <div className="w-px h-6 bg-[#1e1e30]" />
          <TimeframeSelector />
        </div>
      </header>

      {/* Price header */}
      <div className="border-b border-[#1e1e30]">
        <ChartHeader />
      </div>

      {/* Main chart area */}
      <ChartContainer />
    </div>
  );
}
