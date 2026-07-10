"use client";
import React from 'react';

export default function SummaryCards({ result }: { result: any }) {
  const imported = result?.imported ?? 0;
  const skipped = result?.skipped ?? 0;
  const time = result?.processingTimeMs ?? 0;
  const total = (result?.records?.length ?? 0) + skipped;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
        <div className="text-sm font-medium text-emerald-700">Imported</div>
        <div className="mt-2 text-3xl font-semibold text-emerald-950">{imported}</div>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
        <div className="text-sm font-medium text-amber-700">Skipped</div>
        <div className="mt-2 text-3xl font-semibold text-amber-950">{skipped}</div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-sm font-medium text-slate-500">Processing Time</div>
        <div className="mt-2 text-3xl font-semibold text-slate-900">{Math.round(time / 1000)}s</div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 shadow-sm">
        <div className="text-sm font-medium text-slate-300">Total Records</div>
        <div className="mt-2 text-3xl font-semibold text-white">{total}</div>
      </div>
    </div>
  );
}
