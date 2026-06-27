"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildBusinessData,
  CSV_FILE_NAME_KEY,
  mergeTransactions,
  parseTransactionsCsv,
  SEED_CSV_PATH,
  TRANSACTIONS_STORAGE_KEY,
  type AgentTransaction,
  type BusinessData,
} from "@/lib/csvData";

export const CSV_DATA_EVENT = "agentpay_transactions_changed";

const emptyData = buildBusinessData([]);

const readStored = (): { transactions: AgentTransaction[]; sourceName?: string } => {
  if (typeof window === "undefined") return { transactions: [] };
  const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
  const sourceName = localStorage.getItem(CSV_FILE_NAME_KEY) ?? undefined;
  if (!raw) return { transactions: [], sourceName };

  try {
    return { transactions: JSON.parse(raw) as AgentTransaction[], sourceName };
  } catch {
    return { transactions: [], sourceName };
  }
};

const persist = (transactions: AgentTransaction[], sourceName?: string) => {
  localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
  if (sourceName) localStorage.setItem(CSV_FILE_NAME_KEY, sourceName);
  window.dispatchEvent(new Event(CSV_DATA_EVENT));
};

export const useBusinessData = () => {
  const [transactions, setTransactions] = useState<AgentTransaction[]>([]);
  const [sourceName, setSourceName] = useState<string | undefined>();
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    const stored = readStored();
    setTransactions(stored.transactions);
    setSourceName(stored.sourceName);
    setReady(true);
  }, []);

  useEffect(() => {
    const seed = async () => {
      const stored = readStored();
      if (stored.transactions.length > 0) {
        refresh();
        return;
      }

      const response = await fetch(SEED_CSV_PATH);
      const text = await response.text();
      const seeded = parseTransactionsCsv(text);
      persist(seeded, "paytm_7weeks.csv");
      setTransactions(seeded);
      setSourceName("paytm_7weeks.csv");
      setReady(true);
    };

    seed().catch(() => {
      refresh();
      setReady(true);
    });

    window.addEventListener("storage", refresh);
    window.addEventListener(CSV_DATA_EVENT, refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(CSV_DATA_EVENT, refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  const data: BusinessData = useMemo(() => buildBusinessData(transactions, sourceName), [transactions, sourceName]);

  const replaceTransactions = useCallback((next: AgentTransaction[], nextSourceName?: string) => {
    persist(next, nextSourceName ?? sourceName);
  }, [sourceName]);

  const mergeCsvText = useCallback((text: string, fileName: string) => {
    const incoming = parseTransactionsCsv(text);
    const merged = mergeTransactions(readStored().transactions, incoming);
    persist(merged, fileName);
    return incoming.length;
  }, []);

  const addTransaction = useCallback((kind: "sale" | "expense" | "collection", amount: number) => {
    if (!amount) return;
    const type = kind === "expense" ? "DR" : "CR";
    const nextTx: AgentTransaction = {
      id: `manual-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      description: kind === "collection" ? "Collected invoice payment" : kind === "sale" ? "Manual sale" : "Manual expense",
      amount,
      type,
      category: type === "CR" ? "Income" : "Operations",
      customer: "Manual",
      status: "completed",
    };
    const merged = mergeTransactions(readStored().transactions, [nextTx]);
    persist(merged, sourceName);
  }, [sourceName]);

  return { data, ready, replaceTransactions, mergeCsvText, addTransaction };
};

export const resetTransactions = () => {
  localStorage.removeItem(TRANSACTIONS_STORAGE_KEY);
  localStorage.removeItem(CSV_FILE_NAME_KEY);
  window.dispatchEvent(new Event(CSV_DATA_EVENT));
};

export const EMPTY_BUSINESS_DATA = emptyData;
