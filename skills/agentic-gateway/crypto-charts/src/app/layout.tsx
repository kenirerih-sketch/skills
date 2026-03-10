import type { Metadata } from 'next';
import './globals.css';
import AppProviders from '@/components/providers/AppProviders';

export const metadata: Metadata = {
  title: 'Crypto Charts',
  description: 'TradingView-style crypto charting with real-time data',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0f] text-gray-100 antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
