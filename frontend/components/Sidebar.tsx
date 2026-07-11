"use client";
import React from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { label: "Dashboard" },
  { label: "Lead Sources" },
  { label: "Manage Leads" },
];

type Props = {
  open: boolean;
  onNavigate: () => void;
  onClose: () => void;
};

export default function Sidebar({ open, onNavigate, onClose }: Props) {
  const pathname = usePathname() || '/';

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-slate-200 bg-white px-4 py-5 shadow-2xl transition-transform duration-300 ease-out lg:sticky lg:top-20 lg:z-auto lg:h-[calc(100vh-5rem)] lg:w-64 lg:translate-x-0 lg:shadow-sm dark:border-slate-800 dark:bg-slate-900 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      aria-hidden={!open}
    >
      <div className="mb-5 flex items-center justify-between px-2 lg:hidden">
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Navigation</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Tap a section to continue</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          Close
        </button>
      </div>

      <div className="mt-2 min-h-0 flex-1 overflow-auto pr-1">
        <nav className="space-y-2">
          {items.map((it) => {
            let to = '/';
            if (it.label === 'Manage Leads') to = '/manage';
            else if (it.label === 'Dashboard') to = '/dashboard';
            else if (it.label === 'Lead Sources') to = '/';
            const active = pathname === to;
            return (
              <Link
                key={it.label}
                href={to}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'}`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-300'}`}>
                  <div className="text-xs">•</div>
                </div>
                <div className="truncate">{it.label}</div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
