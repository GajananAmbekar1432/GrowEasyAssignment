"use client";
import React, { useEffect, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <Header onMenuClick={() => setSidebarOpen((open) => !open)} sidebarOpen={sidebarOpen} />

      <div className="relative flex min-h-[calc(100vh-4.5rem)]">
        <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} onClose={() => setSidebarOpen(false)} />

        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar overlay"
            className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="container flex-1 py-4 sm:py-6 lg:py-8">
            <main className="min-w-0 flex-1">{children}</main>
          </div>

          <footer className="px-4 py-4 sm:px-6 lg:px-0">
            <div className="container text-sm text-slate-500 dark:text-slate-400">© GrowEasy</div>
          </footer>
        </div>
      </div>
    </div>
  );
}