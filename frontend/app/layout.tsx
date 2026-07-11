import './globals.css';
import React from 'react';
import { LeadsProvider } from '../components/LeadsProvider';
import AppShell from '../components/AppShell';

export const metadata = {
  title: 'CSV AI Exporter',
  description: 'AI-powered CSV importer for GrowEasy CRM',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LeadsProvider>
          <AppShell>{children}</AppShell>
        </LeadsProvider>
      </body>
    </html>
  );
}
