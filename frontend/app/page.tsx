"use client";
import React, { useState } from 'react';
import UploadBox from '../components/UploadBox';
import PreviewTable from '../components/PreviewTable';
import SummaryCards from '../components/SummaryCards';
import ImportModal from '../components/ImportModal';
import { useLeads } from '../components/LeadsProvider';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [records, setRecords] = useState<any[]>([]);
  const [result, setResult] = useState<any | null>(null);
  const [streamingCount, setStreamingCount] = useState(0);
  const [parseProgress, setParseProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const { setLeads, setIsPreviewing, setLastImportResult } = useLeads();

  const [processingMessage, setProcessingMessage] = useState(""); //c
  const handleParsed = (data: any[]) => {
    setRecords(data);
    setResult(null);
    setIsPreviewing(true);
    setStreamingCount(0);
    setParseProgress(100);
  };

  const handleChunk = (rows: any[]) => {
    setRecords((prev) => [...prev, ...rows]);
    setStreamingCount((c) => c + rows.length);
  };

  const handleProgress = (pct: number) => setParseProgress(pct);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const apiRoot = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const resp = await axios.post(`${apiRoot}/api/import`, { records });
      setResult(resp.data);
    } catch (err: any) {
      setResult({ success: false, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();

  const handleConfirmLocal = async () => {
    // persist locally and to API
    setLoading(true);
    setProcessingMessage("AI is processing your CSV and extracting CRM data...");//c
    try {
      const apiRoot = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      // send in batches with retry
      const batchSize = 500;
      const maxRetries = 3;
      let importedTotal = 0;
      let skippedTotal = 0;
      let allRecords: any[] = [];

      for (let i = 0; i < records.length; i += batchSize) {
  const batch = records.slice(i, i + batchSize);

  setProcessingMessage(
    `AI is processing records ${Math.min(i + batch.length, records.length)} of ${records.length}...`
  );

  let attempt = 0;
  let success = false;
  let lastErr: any = null;
        while (attempt < maxRetries && !success) {
          attempt += 1;
          try {
            const resp = await axios.post(`${apiRoot}/api/import`, { records: batch });
            const data = resp.data;
            // assume API returns counts
            importedTotal += data.imported ?? (data.records ? data.records.length : 0);
            skippedTotal += data.skipped ?? 0;
            if (Array.isArray(data.records)) allRecords = [...allRecords, ...data.records];
            success = true;
          } catch (err: any) {
            lastErr = err;
            // wait before retrying
            await new Promise((r) => setTimeout(r, 500 * attempt));
          }
        }
        if (!success) throw lastErr;
      }

      const data = { success: true, imported: importedTotal, skipped: skippedTotal, records: allRecords.length ? allRecords : records };
      // use API response records for Manage Leads
      if (data && Array.isArray(data.records)) {
        setLeads(data.records);
      } else if (Array.isArray(records)) {
        setLeads(records);
      }
      setResult(data);
      // store last import summary so Manage page can render the cards
      setLastImportResult?.(data ?? null);
      // clear preview flag and redirect to Manage Leads after successful import
     if (data && data.success) {
  setProcessingMessage("Finalizing import and preparing Manage Leads...");

  setIsPreviewing(false);

  // Optional: give the user a brief moment to see the message
  await new Promise((resolve) => setTimeout(resolve, 800));

  router.push('/manage');
}
    } catch (err: any) {
      setResult({ success: false, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100">
      <section className="py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Lead Sources</h1>
            <p className="mt-1 text-sm text-slate-500">Connect, manage, and control all your lead channels from one dashboard.</p>
          </div>
        </div>
      </section>

      {records.length === 0 && (
        <div className="mt-6">
          <UploadBox onParsed={handleParsed} onChunk={handleChunk} onProgress={handleProgress} />
        </div>
      )}

      {records.length > 0 && (
        <section className="space-y-4 relative">
          <div className="flex items-center">
            <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Preview</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Review the parsed rows before importing them.</p>
            </div>
          </div>

          {(parseProgress < 100 || streamingCount > 0) && (
            <div className="mt-3">
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" style={{ width: `${parseProgress}%` }} />
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-300">Parsing... {parseProgress}% • {streamingCount} rows received</div>
            </div>
          )}

          <div className="relative">
            <PreviewTable
              data={records}
              onConfirm={handleConfirmLocal}
              confirmLoading={loading}
              onCancel={() => {
                setRecords([]);
                setIsPreviewing(false);
                setResult(null);
              }}
            />
          </div>
        </section>
      )}
      

      {/* {result && (
        <section className="space-y-4">
          <SummaryCards result={result} />
        </section>
      )} */}


      {loading && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900">
      <div className="flex flex-col items-center">

        <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />

        <h3 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">
          AI Processing
        </h3>

        <p className="mt-3 text-center text-sm text-slate-600 dark:text-slate-300">
          {processingMessage}
        </p>

        <p className="mt-5 text-xs text-slate-500 dark:text-slate-400">
          Please don't close or refresh this page.
        </p>

      </div>
    </div>
  </div>
)}
    </div>
  );
}
