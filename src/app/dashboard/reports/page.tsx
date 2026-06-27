"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2, PieChart, TrendingUp, Wallet } from "lucide-react";
import { parseDate, type AgentTransaction } from "@/lib/csvData";
import { useBusinessData } from "@/lib/useBusinessData";
import { formatCurrency } from "@/lib/utils";

const card = "rounded-2xl border border-white/6 bg-[#12121a] p-5";

const sumByType = (rows: AgentTransaction[], type: "CR" | "DR") => rows.filter(tx => tx.type === type).reduce((sum, tx) => sum + tx.amount, 0);

const groupSum = (rows: AgentTransaction[], keyFor: (tx: AgentTransaction) => string) => {
  return Array.from(rows.reduce((map, tx) => {
    const key = keyFor(tx);
    map.set(key, (map.get(key) ?? 0) + tx.amount);
    return map;
  }, new Map<string, number>()).entries()).sort((a, b) => b[1] - a[1]);
};

const weekKey = (tx: AgentTransaction) => {
  const date = parseDate(tx.date);
  const start = new Date(date.getFullYear(), 0, 1).getTime();
  return `${date.getFullYear()} W${Math.ceil((((date.getTime() - start) / 86400000) + 1) / 7)}`;
};

const summarize = (title: string, rows: AgentTransaction[]) => {
  const credits = sumByType(rows, "CR");
  const debits = sumByType(rows, "DR");
  const topCategory = groupSum(rows.filter(tx => tx.type === "DR"), tx => tx.category)[0];
  const topIncome = groupSum(rows.filter(tx => tx.type === "CR"), tx => tx.description)[0];
  return [
    `${title}`,
    `Rows analyzed: ${rows.length}`,
    `Credits total ${formatCurrency(credits)}, debits total ${formatCurrency(debits)}, net ${formatCurrency(credits - debits)}.`,
    topCategory ? `Largest spending category is ${topCategory[0]} at ${formatCurrency(topCategory[1])}.` : "No debit categories found.",
    topIncome ? `Largest income source is ${topIncome[0]} at ${formatCurrency(topIncome[1])}.` : "No credit sources found.",
  ].join("\n");
};

export default function ReportsPage() {
  const { data } = useBusinessData();
  const [generating, setGenerating] = useState<string | null>(null);
  const [output, setOutput] = useState<Record<string, string>>({});
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState<"all" | "CR" | "DR">("all");

  const reportData = useMemo(() => {
    const credits = sumByType(data.transactions, "CR");
    const debits = sumByType(data.transactions, "DR");
    const spending = groupSum(data.transactions.filter(tx => tx.type === "DR"), tx => tx.category);
    const income = groupSum(data.transactions.filter(tx => tx.type === "CR"), tx => tx.description);
    const biggestExpense = data.transactions.filter(tx => tx.type === "DR").sort((a, b) => b.amount - a.amount)[0];
    const weekly = groupSum(data.transactions, weekKey).slice(0, 8);
    return { credits, debits, spending, income, biggestExpense, weekly };
  }, [data.transactions]);

  const reports = [
    {
      id: "pl",
      title: "P&L Statement",
      desc: `CSV date range: ${data.dateRange}`,
      icon: TrendingUp,
      value: formatCurrency(reportData.credits - reportData.debits),
      label: "Credit - Debit",
      rows: data.transactions,
    },
    {
      id: "spending",
      title: "Spending Summary",
      desc: `Top categories: ${reportData.spending.slice(0, 3).map(([name]) => name).join(", ") || "None"}`,
      icon: PieChart,
      value: reportData.biggestExpense ? formatCurrency(reportData.biggestExpense.amount) : "No expense",
      label: "Biggest expense",
      rows: data.transactions.filter(tx => tx.type === "DR"),
    },
    {
      id: "income",
      title: "Income Summary",
      desc: `Sources: ${reportData.income.map(([name]) => name).slice(0, 3).join(", ") || "None"}`,
      icon: Wallet,
      value: formatCurrency(reportData.credits),
      label: "Total income",
      rows: data.transactions.filter(tx => tx.type === "CR"),
    },
    {
      id: "weekly",
      title: "Weekly Trend Report",
      desc: `${reportData.weekly.length} week buckets from CSV transactions`,
      icon: FileText,
      value: String(reportData.weekly.length),
      label: "Weeks",
      rows: data.transactions,
    },
  ];

  const generate = async (id: string, title: string, rows: AgentTransaction[]) => {
    setGenerating(id);
    const localSummary = summarize(title, rows);
    const response = await fetch("/api/ai-summary", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        prompt: `Write a concise plain-English ${title} for these filtered transactions.`,
        context: `${data.summaryText}\n\nFiltered report fallback:\n${localSummary}`,
      }),
    }).catch(() => null);
    const ai = response ? await response.json().catch(() => ({ summary: "" })) : { summary: "" };
    setOutput(previous => ({ ...previous, [id]: ai.summary || localSummary }));
    setGenerating(null);
  };

  const filteredRows = data.transactions.filter(tx => {
    const afterFrom = !from || tx.date >= from;
    const beforeTo = !to || tx.date <= to;
    const matchesType = type === "all" || tx.type === type;
    return afterFrom && beforeTo && matchesType;
  });

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3 rounded-xl border border-violet-500/15 bg-violet-600/10 px-4 py-3 text-sm text-violet-200">
        <FileText className="h-4 w-4 flex-shrink-0" />
        Reports are computed from {data.transactions.length} CSV transactions in localStorage.
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((report, index) => (
          <motion.div key={report.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className={card}>
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-600/20">
                <report.icon className="h-5 w-5 text-violet-200" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{report.title}</h3>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{report.desc}</p>
              </div>
            </div>
            <div className="mb-4">
              <div className="text-xl font-bold text-white">{report.value}</div>
              <div className="text-xs text-slate-500">{report.label}</div>
            </div>
            <button onClick={() => generate(report.id, report.title, report.rows)} disabled={generating === report.id} className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/25 bg-violet-600/15 py-2.5 text-xs font-medium text-violet-200 disabled:opacity-50">
              {generating === report.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
              Generate
            </button>
            {output[report.id] && <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-white/6 bg-black/20 p-3 text-xs leading-relaxed text-slate-300">{output[report.id]}</pre>}
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/6 bg-[#12121a] p-6">
        <h3 className="mb-1 font-semibold text-white">Custom Report</h3>
        <p className="mb-4 text-xs text-slate-500">Filter CSV by date range and type, then compute totals.</p>
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <input type="date" value={from} onChange={event => setFrom(event.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 outline-none" />
          <input type="date" value={to} onChange={event => setTo(event.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 outline-none" />
          <select value={type} onChange={event => setType(event.target.value as "all" | "CR" | "DR")} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 outline-none">
            <option value="all">All transactions</option>
            <option value="CR">Income only</option>
            <option value="DR">Expenses only</option>
          </select>
        </div>
        <button onClick={() => generate("custom", "Custom Report", filteredRows)} className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white">Generate Custom Report</button>
        {output.custom && <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-white/6 bg-black/20 p-3 text-xs leading-relaxed text-slate-300">{output.custom}</pre>}
      </motion.div>
    </div>
  );
}
