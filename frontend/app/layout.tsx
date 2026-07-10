import './globals.css';
import React from 'react';
import Sidebar from '../components/Sidebar';
import { LeadsProvider } from '../components/LeadsProvider';
import Header from '../components/Header';

export const metadata = {
  title: 'CSV AI Exporter',
  description: 'AI-powered CSV importer for GrowEasy CRM',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LeadsProvider>
          <Header />

          <div className="min-h-screen flex">
            <div className="hidden lg:block">
              <Sidebar />
            </div>

            <div className="flex-1 flex flex-col">
              <div className="container py-6 flex-1">
                <main className="flex-1">{children}</main>
              </div>

              <footer className="py-4">
                <div className="container text-sm text-gray-500">© GrowEasy</div>
              </footer>
            </div>
          </div>
        </LeadsProvider>
      </body>
    </html>
  );
}
