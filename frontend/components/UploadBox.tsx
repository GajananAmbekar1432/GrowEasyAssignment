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
    if (!file.name.endsWith('.csv')) {
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
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      worker: true,
      step: (row: any, _parser) => {
        // `row` is a step result with `.data`; guard defensively
        if (row && typeof row.data !== 'undefined') {
          buffer.push(row.data);
        }
        if (buffer.length >= chunkSize) {
          onChunk?.(buffer.splice(0, buffer.length));
        }
        if (onProgress && (row as any).meta && typeof (row as any).meta.cursor === 'number') {
          const pct = Math.min(100, Math.round(((row as any).meta.cursor / file.size) * 100));
          onProgress(pct);
        }
      },
      complete: (results: Papa.ParseResult<any> | undefined) => {
        // flush remaining
        if (buffer.length > 0) onChunk?.(buffer.splice(0, buffer.length));
        const parsed = results && (results as any).data ? (results as any).data : [];
        try {
          onParsed(parsed as any[]);
        } catch (e) {
          // defensive: surface parse issues
          console.error('onParsed handler threw', e);
        }
        onProgress?.(100);
      },
      error: (err: Papa.ParseError) => {
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
        className="rounded-2xl border-4 border-dashed border-slate-300 bg-white p-10 text-center shadow-[inset_0_6px_0_rgba(15,23,42,0.02)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-none"
      >
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Upload CSV</p>
        <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">Drag & drop your CSV here, or choose a file</p>
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
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            Choose File
          </button>
        </div>
      </div>
    </div>
  );
}
