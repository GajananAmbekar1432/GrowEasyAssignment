"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

type Lead = Record<string, any>;

type Ctx = {
  leads: Lead[];
  setLeads: (l: Lead[]) => void;
  addLeads: (l: Lead[]) => void;
  isPreviewing: boolean;
  setIsPreviewing: (v: boolean) => void;
  lastImportResult: any | null;
  setLastImportResult: (r: any | null) => void;
};

const LeadsContext = createContext<Ctx | undefined>(undefined);

export function LeadsProvider({ children }: { children: React.ReactNode }) {
  // Transient in-memory leads store (stateless across reloads)
  const [leads, setLeadsState] = useState<Lead[]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [lastImportResult, setLastImportResult] = useState<any | null>(null);

  const setLeads = (l: Lead[]) => setLeadsState(l);
  const addLeads = (l: Lead[]) => setLeadsState((prev) => [...l, ...prev]);

  return (
    <LeadsContext.Provider value={{ leads, setLeads, addLeads, isPreviewing, setIsPreviewing, lastImportResult, setLastImportResult }}>
      {children}
    </LeadsContext.Provider>
  );
}

export function useLeads() {
  const c = useContext(LeadsContext);
  if (!c) throw new Error('useLeads must be used within LeadsProvider');
  return c;
}
