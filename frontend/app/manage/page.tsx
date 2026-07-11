"use client";
import React from 'react';
import { useLeads } from '../../components/LeadsProvider';
import { getOrderedColumns } from '../../utils/tableColumns';

export default function ManagePage() {
  const { leads } = useLeads();
  const { lastImportResult } = useLeads();

  const result = lastImportResult ?? { records: leads, imported: leads.length, skipped: 0, processingTimeMs: 0 };
  const columns = getOrderedColumns(leads as Array<Record<string, any>>);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Total Leads</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{(result.records?.length ?? leads.length)}</div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <div className="text-sm font-medium text-emerald-700">Imported</div>
          <div className="mt-2 text-3xl font-semibold text-emerald-950">{result.imported ?? leads.length}</div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="text-sm font-medium text-amber-700">Skipped</div>
          <div className="mt-2 text-3xl font-semibold text-amber-950">{result.skipped ?? 0}</div>
        </div>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Manage Your Leads</h2>
          <div className="text-sm text-slate-500">{leads.length} leads</div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="overflow-auto">
          <div className="min-w-full text-sm">
            {leads.length === 0 ? (
              <div className="p-6 text-center text-slate-400">No leads yet</div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-xs text-slate-500">
                    {columns.map((col) => (
                      <th key={col} className="p-3 align-top">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((r, i) => (
                    <tr key={i} className="border-t">
                      {columns.map((col) => (
                        <td key={col} className="p-3 align-top">{String((r as any)[col] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
