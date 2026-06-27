"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CsvImporter } from "@/app/dashboard/CsvImporter";
import { useBusinessData } from "@/lib/useBusinessData";
import { cn, formatCurrency } from "@/lib/utils";

const card = "rounded-2xl border border-white/6 bg-[#12121a] p-5";

export default function TransactionAnalysisPage() {
  const { data } = useBusinessData();
  const [month, setMonth] = useState("all");
  const [type, setType] = useState<"all" | "CR" | "DR">("all");
  const [category, setCategory] = useState("all");

  const months = useMemo(() => Array.from(new Set(data.transactions.map(tx => tx.date.slice(0, 7)))).sort(), [data.transactions]);
  const categories = useMemo(() => Array.from(new Set(data.transactions.map(tx => tx.category))).sort(), [data.transactions]);

  const filtered = data.transactions.filter(tx => {
    const matchMonth = month === "all" || tx.date.startsWith(month);
    const matchType = type === "all" || tx.type === type;
    const matchCategory = category === "all" || tx.category === category;
    return matchMonth && matchType && matchCategory;
  }).slice().sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-7xl space-y-6">
      <CsvImporter sourceName={data.sourceName} />

      <div className={card}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <h3 className="font-semibold text-white">Transaction Analysis</h3>
            <p className="mt-1 text-xs text-slate-500">{filtered.length} of {data.transactions.length} transactions · {data.dateRange}</p>
          </div>
          <select value={month} onChange={e => setMonth(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 outline-none">
            <option value="all">All months</option>
            {months.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={type} onChange={e => setType(e.target.value as "all" | "CR" | "DR")} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 outline-none">
            <option value="all">All types</option>
            <option value="CR">CR</option>
            <option value="DR">DR</option>
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 outline-none">
            <option value="all">All categories</option>
            {categories.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden rounded-2xl border border-white/6 bg-[#12121a]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-white/6">
                {["Date", "Description", "Amount", "Type", "Category", "Customer"].map(header => (
                  <th key={header} className="px-5 py-3.5 text-left text-xs font-medium text-slate-500">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(tx => (
                <tr key={tx.id} className="border-b border-white/4 last:border-0">
                  <td className="px-5 py-3 text-xs text-slate-500">{tx.date}</td>
                  <td className="px-5 py-3 text-sm text-slate-200">{tx.description}</td>
                  <td className={cn("px-5 py-3 text-sm font-semibold", tx.type === "CR" ? "text-emerald-400" : "text-red-400")}>
                    {tx.type === "CR" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </td>
                  <td className="px-5 py-3">
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px]", tx.type === "CR" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400" : "border-red-400/20 bg-red-400/10 text-red-400")}>{tx.type}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400">{tx.category}</td>
                  <td className="px-5 py-3 text-xs text-slate-400">{tx.customer}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-12 text-center text-sm text-slate-600">No transactions match these filters.</div>}
        </div>
      </motion.div>
    </div>
  );
}
