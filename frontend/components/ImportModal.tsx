"use client";
import React from "react";
import UploadBox from "./UploadBox";
import PreviewTable from "./PreviewTable";

type Props = {
  open: boolean;
  onClose: () => void;
  records: any[];
  setRecords: (r: any[]) => void;
  onConfirm: () => void;
  loading?: boolean;
};

export default function ImportModal({ open, onClose, records, setRecords, onConfirm, loading }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-[92%] max-w-2xl rounded-2xl bg-white p-6 shadow-[0_30px_60px_rgba(15,23,42,0.25)]">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Import Leads via CSV</h3>
            <p className="mt-1 text-sm text-slate-500">Upload a CSV file to bulk import leads into your system.</p>
          </div>
          <button onClick={onClose} className="ml-4 rounded-full p-2 text-slate-500 hover:bg-slate-100">
            ✕
          </button>
        </div>

        <div className="mt-6">
          {records.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 p-6">
              <UploadBox onParsed={(d) => setRecords(d)} onFileName={() => {}} />

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-slate-500">Supported file: .csv (max 5MB)</div>
                <a href="#" className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">Download Sample CSV Template</a>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 p-2">
              <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm font-medium">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v20" stroke="#D9462E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div className="truncate">Uploaded CSV</div>
                </div>
                <div className="ml-auto text-sm text-slate-500">{records.length} rows</div>
              </div>

              <div className="p-4">
                <PreviewTable data={records} />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={() => { setRecords([]); onClose(); }} className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700">
            Cancel
          </button>
          <button
            disabled={records.length === 0 || loading}
            onClick={() => onConfirm()}
            className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Uploading...' : (records.length === 0 ? 'Upload File' : 'Upload File')}
          </button>
        </div>
      </div>
    </div>
  );
}
