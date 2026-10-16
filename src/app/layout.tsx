import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'NMS 08 Digital Governance Platform | Ex-Boys Alumni Association',
  description: 'Official Digital Governance & Alumni Portal for the Nigerian Military School Class of 2008 (Ex-Boys). Fostering democratic governance, welfare, dues transparency, and lifelong brotherhood.',
  keywords: ['NMS 08', 'Nigerian Military School', 'Ex-Boys 2008', 'NMS Alumni', 'Digital Governance'],
  icons: {
    icon: '/icon.webp',
    shortcut: '/icon.webp',
    apple: '/icon.webp',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#fbfbfd] text-slate-900 min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
        <Navbar />
        <main className="flex-1 pt-28 sm:pt-32">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
