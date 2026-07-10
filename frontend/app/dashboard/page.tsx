"use client";
import React from 'react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Total Leads</div>
          <div className="mt-2 text-2xl font-semibold">1,234</div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Imported Today</div>
          <div className="mt-2 text-2xl font-semibold">24</div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Conversion Rate</div>
          <div className="mt-2 text-2xl font-semibold">3.6%</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Leads Over Time</div>
          <div className="mt-4 h-40 flex items-end gap-2">
            {/* simple bar chart */}
            <svg width="100%" height="100%" viewBox="0 0 200 80" preserveAspectRatio="none">
              <rect x="12" y="30" width="18" height="50" rx="3" fill="#60A5FA" />
              <rect x="42" y="20" width="18" height="60" rx="3" fill="#3B82F6" />
              <rect x="72" y="40" width="18" height="40" rx="3" fill="#2563EB" />
              <rect x="102" y="10" width="18" height="70" rx="3" fill="#1D4ED8" />
              <rect x="132" y="25" width="18" height="55" rx="3" fill="#1E40AF" />
            </svg>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Source Breakdown</div>
          <div className="mt-4 h-40 flex items-center justify-center">
            {/* simple pie chart */}
            <svg width="120" height="120" viewBox="0 0 32 32">
              <circle r="16" cx="16" cy="16" fill="#F3F4F6" />
              <path d="M16 16 L16 0 A16 16 0 0 1 32 16 z" fill="#60A5FA" />
              <path d="M16 16 L32 16 A16 16 0 0 1 20 29 z" fill="#3B82F6" />
              <path d="M16 16 L20 29 A16 16 0 0 1 6 23 z" fill="#2563EB" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">AI Processing Time (last 30)</div>
          <div className="mt-4 h-40">
            {/* simple sparkline / area chart */}
            <svg width="100%" height="100%" viewBox="0 0 200 80" preserveAspectRatio="none">
              <polyline fill="#DBEAFE" stroke="#60A5FA" strokeWidth="2" points="0,60 20,50 40,45 60,30 80,35 100,25 120,20 140,30 160,22 180,18 200,14" />
              <polyline fill="none" stroke="#2563EB" strokeWidth="2" points="0,60 20,50 40,45 60,30 80,35 100,25 120,20 140,30 160,22 180,18 200,14" />
            </svg>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Import Status</div>
          <div className="mt-4 flex items-center gap-6">
            <div className="flex-shrink-0">
              <svg width="120" height="120" viewBox="0 0 32 32">
                <circle r="16" cx="16" cy="16" fill="#0f1724" opacity="0.06" />
                <path d="M16 16 L16 0 A16 16 0 0 1 28 12 z" fill="#10B981" />
                <path d="M16 16 L28 12 A16 16 0 0 1 20 28 z" fill="#F59E0B" />
                <path d="M16 16 L20 28 A16 16 0 0 1 6 22 z" fill="#EF4444" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-slate-600">Imported <span className="font-semibold text-slate-900">78%</span></div>
              <div className="mt-2 text-sm text-slate-600">Skipped <span className="font-semibold text-amber-700">12%</span></div>
              <div className="mt-2 text-sm text-slate-600">Failed <span className="font-semibold text-red-600">10%</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
