"use client";
import React, { useCallback, useRef } from 'react';
import Papa from 'papaparse';

type Props = {
  onParsed: (data: any[]) => void;
  onFileName?: (name: string | null) => void;
  maxSizeMB?: number;
  onChunk?: (rows: any[]) => void;
  onProgress?: (pct: number) => void;
  chunkSize?: number;
};

export default function UploadBox({ onParsed, onFileName, maxSizeMB = 5, onChunk, onProgress, chunkSize = 500 }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = useCallback((file: File | null) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Only CSV files allowed');
      return;
    }
    onFileName?.(file.name);
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert('File too large');
      return;
    }

    // streaming parse with chunks
    const buffer: any[] = [];
    const allRows: any[] = [];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      // run on main thread for reliability in dev/build
      worker: false,
      step: (row: any, _parser: any) => {
        // `row` is a step result with `.data`; guard defensively
        console.log('UploadBox: parse step', row);
        if (row && typeof row.data !== 'undefined') {
          buffer.push(row.data);
          allRows.push(row.data);
        }
        if (buffer.length >= chunkSize) {
          onChunk?.(buffer.splice(0, buffer.length));
        }
        if (onProgress && (row as any).meta && typeof (row as any).meta.cursor === 'number') {
          const pct = Math.min(100, Math.round(((row as any).meta.cursor / file.size) * 100));
          onProgress(pct);
        }
      },
      complete: (results: any) => {
        console.log('UploadBox: parse complete', results);
        // flush remaining
        if (buffer.length > 0) onChunk?.(buffer.splice(0, buffer.length));
        // Papa may not populate `results.data` when using `step`; fall back to accumulated rows
        const parsed = results && (results as any).data && (results as any).data.length ? (results as any).data : allRows;
        try {
          onParsed(parsed as any[]);
        } catch (e) {
          // defensive: surface parse issues
          console.error('onParsed handler threw', e);
        }
        onProgress?.(100);
      },
      error: (err: any) => {
        alert('Failed to parse CSV: ' + err.message);
      },
    });
  }, [onParsed, onChunk, onProgress, maxSizeMB, chunkSize, onFileName]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    handleFile(f ?? null);
  };

  // notify when user clears selection via re-selecting no file
  const clearSelection = () => onFileName?.(null);

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="rounded-2xl border-4 border-dashed border-slate-300 bg-white p-6 text-center shadow-[inset_0_6px_0_rgba(15,23,42,0.02)] sm:p-8 lg:p-10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500 sm:text-xs">Upload CSV</p>
        <p className="mt-3 text-xl font-semibold text-slate-900 sm:text-2xl dark:text-slate-100">Drag & drop your CSV here, or choose a file</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">We’ll parse it locally and show a preview before importing.</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <div className="mt-6 flex items-center justify-center">
          <button
            onClick={() => inputRef.current?.click()}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 sm:w-auto dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            Choose File
          </button>
        </div>
      </div>
    </div>
  );
}
