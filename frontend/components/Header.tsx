"use client";
import React, { useEffect, useState } from 'react';

type Props = {
  onMenuClick: () => void;
  sidebarOpen: boolean;
};

export default function Header({ onMenuClick, sidebarOpen }: Props) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="container relative flex min-h-16 items-center justify-between py-4 sm:py-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={sidebarOpen}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 lg:hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
            </span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-900 font-bold text-white">GE</div>
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">Grow Easy</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const next = document.documentElement.classList.toggle('dark');
              setDark(next);
            }}
            aria-label="Toggle dark mode"
            className="rounded-full bg-slate-100/60 p-2 text-slate-700 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:text-slate-200"
          >
            {dark ? '🌙' : '☀️'}
          </button>
          <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm text-slate-700 dark:text-slate-200">JD</div>
        </div>
      </div>
    </header>
  );
}
