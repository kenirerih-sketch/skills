'use client';

import { useChartStore } from '@/store/chartStore';
import { TIMEFRAMES } from '@/lib/chart/timeframes';

export default function TimeframeSelector() {
  const { interval, setInterval } = useChartStore();

  return (
    <div className="flex items-center gap-1">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf.interval}
          onClick={() => setInterval(tf.interval)}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            interval === tf.interval
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {tf.label}
        </button>
      ))}
    </div>
  );
}
