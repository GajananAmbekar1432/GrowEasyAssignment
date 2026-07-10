"use client";
import React from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { label: "Dashboard" },
  { label: "Lead Sources" },
  { label: "Manage Leads" },
];

export default function Sidebar() {
  const pathname = usePathname() || '/';

  return (
    <aside className="w-64 shrink-0 bg-white px-6 pt-2 pb-4 shadow-sm sticky top-16 self-start h-[calc(100vh-96px)]">
      {/* Sidebar header removed; keeping menu flush under top */}

      <div className="mt-2 overflow-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        <nav className="space-y-2">
            {items.map((it) => {
            let to = '/';
            if (it.label === 'Manage Leads') to = '/manage';
            else if (it.label === 'Dashboard') to = '/dashboard';
            else if (it.label === 'Lead Sources') to = '/';
            const active = pathname === to;
            return (
              <Link key={it.label} href={to} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                <div className={`h-9 w-9 flex items-center justify-center rounded-full ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
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
