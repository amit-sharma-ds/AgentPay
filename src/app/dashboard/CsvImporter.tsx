"use client";

import { ChangeEvent, useState } from "react";
import { FileUp, RotateCcw } from "lucide-react";
import { resetTransactions, useBusinessData } from "@/lib/useBusinessData";
import { cn } from "@/lib/utils";

export function CsvImporter({ sourceName, className }: { sourceName?: string; className?: string }) {
  const { mergeCsvText } = useBusinessData();
  const [message, setMessage] = useState("");

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const count = mergeCsvText(await file.text(), file.name);
    setMessage(count > 0 ? `Merged ${count} rows from ${file.name}` : "CSV needs headers and at least one amount row.");
    event.target.value = "";
  };

  const reset = () => {
    resetTransactions();
    setMessage("Demo CSV will reload on refresh.");
  };

  return (
    <div className={cn("rounded-2xl border border-white/6 bg-[#12121a] p-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">CSV Data Source</h3>
          <p className="mt-1 text-xs text-slate-500">
            {sourceName ? `Using ${sourceName}` : "Auto-seeded from paytm_7weeks.csv"}
          </p>
          {message && <p className="mt-1 text-xs text-cyan-300">{message}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-violet-600/20 px-3 py-2 text-xs font-medium text-violet-200 transition hover:bg-violet-600/30">
            <FileUp className="h-3.5 w-3.5" />
            Upload CSV
            <input type="file" accept=".csv,text/csv" onChange={handleUpload} className="sr-only" />
          </label>
          <button onClick={reset} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset demo
          </button>
        </div>
      </div>
    </div>
  );
}
