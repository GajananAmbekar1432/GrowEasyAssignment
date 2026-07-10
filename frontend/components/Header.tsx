"use client";
import React, { useEffect, useState } from 'react';
import { useLeads } from './LeadsProvider';

export default function Header() {
  const { isPreviewing } = useLeads();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm dark:bg-slate-900">
      <div className="py-8">
        <div className="absolute left-20 top-1/2 -translate-y-1/2 flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold">GE</div>
          <div className="text-lg font-semibold ml-1 text-slate-900 dark:text-slate-100">Easy Growth</div>
        </div>

        <div className="absolute right-20 top-1/2 -translate-y-1/2 flex items-center gap-3">
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
