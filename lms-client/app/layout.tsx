import './globals.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import ToasterClient from '../components/ui/ToasterClient';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Oxford Grammar & Cambridge EdTech School | Academic Management System',
  description:
    'Comprehensive Academic ERP and Learning Management System for Oxford Grammar & Cambridge EdTech School. Managing admissions, attendance, bank fee challans, and faculty scheduling.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-950">
        {children}
        <ToasterClient />
      </body>
    </html>
  );
}
