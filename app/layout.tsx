import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Turing Pelican Evals Platform Issue Tracker',
  description: 'Track bugs and feature requests',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}