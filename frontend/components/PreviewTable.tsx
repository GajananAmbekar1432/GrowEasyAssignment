"use client";
import React, { useMemo, useState } from 'react';

type Props = { data: any[]; onConfirm?: () => void; confirmLoading?: boolean; onCancel?: () => void };

export default function PreviewTable({ data, onConfirm, confirmLoading, onCancel }: Props) {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const pageSize = 10;
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);
  const rowHeight = 56; // estimated row height for virtualization

  const filtered = useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
  }, [data, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages);
  const slice = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const columns = filtered[0] ? Object.keys(filtered[0]) : [];

  // virtualization calculations
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onResize = () => setContainerHeight(el.clientHeight || 400);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const totalRows = filtered.length;
  const visibleCount = Math.ceil(containerHeight / rowHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 3);
  const endIndex = Math.min(totalRows, startIndex + visibleCount + 6);
  const visibleRows = filtered.slice(startIndex, endIndex);
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-800/60">
        <input
          placeholder="Search..."
          value={query}
          onChange={(e) => {
            setPage(1);
            setQuery(e.target.value);
          }}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:max-w-md dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:ring-slate-700"
        />
        <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {filtered.length} record{filtered.length === 1 ? '' : 's'}
        </div>
      </div>

      <div ref={containerRef} onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)} className="max-h-[60vh] overflow-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800">
            <tr>
              {columns.length > 0 ? (
                columns.map((k) => (
                  <th
                    key={k}
                    className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 dark:border-slate-700 dark:text-slate-300"
                  >
                    {k.replace(/_/g, ' ')}
                  </th>
                ))
              ) : (
                <th className="px-4 py-10 text-center text-slate-500 dark:text-slate-400" colSpan={Math.max(columns.length, 1)}>No data loaded yet</th>
              )}
            </tr>
          </thead>
          <tbody>
            {totalRows > 0 ? (
              <>
                {/* top spacer */}
                <tr style={{ height: startIndex * rowHeight }} />
                {visibleRows.map((row, idx) => (
                  <tr key={startIndex + idx} className="border-b border-slate-100 odd:bg-white even:bg-slate-50/60 hover:bg-amber-50/60 dark:odd:bg-slate-800 dark:even:bg-slate-700 dark:hover:bg-slate-700" style={{ height: rowHeight }}>
                    {columns.map((key) => (
                      <td key={key} className="max-w-[20rem] px-4 py-3 align-top text-slate-700 dark:text-slate-200">
                        <div className="line-clamp-2 break-words">{String((row as any)[key] ?? '')}</div>
                      </td>
                    ))}
                  </tr>
                ))}
                {/* bottom spacer */}
                <tr style={{ height: Math.max(0, (totalRows - endIndex) * rowHeight) }} />
              </>
            ) : (
              <tr>
                <td className="px-4 py-12 text-center text-slate-500 dark:text-slate-400" colSpan={Math.max(columns.length, 1)}>
                  {query ? 'No rows match your search.' : 'Upload a CSV to preview the parsed rows here.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
        <div>
          Page {safePage} of {pages}
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Prev
          </button>
          <button
            disabled={safePage >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Next
          </button>
        </div>
      </div>

      {/* confirm button placed just below pagination */}
      <div className="px-4 py-4 text-right bg-white dark:bg-slate-900">
        {onCancel && (
          <button
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm mr-3 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            Cancel
          </button>
        )}

        {onConfirm && (
          <button
            onClick={onConfirm}
            disabled={confirmLoading}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-50 dark:bg-emerald-600"
          >
            {confirmLoading ? 'Importing...' : 'Confirm Import'}
          </button>
        )}
      </div>
    </div>
  );
}
