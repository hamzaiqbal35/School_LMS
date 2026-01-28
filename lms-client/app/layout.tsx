import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ToasterClient from '../components/ui/ToasterClient';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'School LMS',
  description: 'Oxford Grammar School',
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
    <html lang="en">
      <body className={inter.className}>
        {children}
        <ToasterClient />
      </body>
    </html>
  );
}
