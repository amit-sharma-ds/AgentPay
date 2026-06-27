"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckSquare, FileText, Minus, Plus, TrendingDown, TrendingUp, Users } from "lucide-react";
import { CsvImporter } from "@/app/dashboard/CsvImporter";
import { LineChartSvg } from "@/app/dashboard/SvgCharts";
import { useBusinessData } from "@/lib/useBusinessData";
import { cn, formatCurrency } from "@/lib/utils";

const card = "rounded-2xl border border-white/6 bg-[#12121a] p-5";
const ICONS: Record<string, React.ElementType> = { TrendingUp, Users, FileText, CheckSquare };

export default function DashboardHome() {
  const { data, addTransaction } = useBusinessData();
  const [entryAmount, setEntryAmount] = useState("");

  const currentMonth = data.revenueData[data.revenueData.length - 1] ?? { month: "Now", revenue: 0, expenses: 0, profit: 0 };
  const previousMonth = data.revenueData[data.revenueData.length - 2] ?? currentMonth;
  const revenueChange = previousMonth.revenue > 0 ? Number((((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100).toFixed(1)) : 0;
  const openTaskCount = data.tasks.filter(task => task.status !== "done").length;
  const profitMargin = currentMonth.revenue > 0 ? currentMonth.profit / currentMonth.revenue : 0;
  const cashFlowScore = Math.min(100, Math.max(0, Math.round(profitMargin * 160)));
  const collectionsScore = Math.max(0, 100 - Math.round((data.pendingAmount / Math.max(currentMonth.revenue, 1)) * 100));
  const taskScore = Math.max(0, 100 - openTaskCount * 10);
  const healthScore = Math.round(cashFlowScore * 0.4 + collectionsScore * 0.35 + taskScore * 0.25);

  const stats = useMemo(() => ([
    { label: "Monthly Revenue", value: formatCurrency(currentMonth.revenue), change: revenueChange, icon: "TrendingUp" },
    { label: "Active Customers", value: String(data.activeCustomerCount), change: 0, icon: "Users" },
    { label: "Pending Invoices", value: formatCurrency(data.pendingAmount), change: data.pendingAmount > 0 ? -1 : 0, icon: "FileText" },
    { label: "Open Tasks", value: String(openTaskCount), change: 0, icon: "CheckSquare" },
  ]), [currentMonth.revenue, revenueChange, data.activeCustomerCount, data.pendingAmount, openTaskCount]);

  const submitLive = (kind: "sale" | "expense" | "collection") => {
    const amount = Math.max(0, Number(entryAmount) || 0);
    addTransaction(kind, amount);
  };

  return (
    <div className="max-w-7xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Good morning, Priya</h2>
        <p className="mt-1 text-sm text-slate-400">Here&apos;s what your AI operator found for {data.businessName}.</p>
      </div>

      <CsvImporter sourceName={data.sourceName} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = ICONS[stat.icon] ?? TrendingUp;
          const isPositive = stat.change >= 0;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className={card}>
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-600/10">
                  <Icon className="h-4 w-4 text-violet-300" />
                </div>
                {stat.change !== 0 && (
                  <span className={cn("flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs", isPositive ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400")}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(stat.change)}%
                  </span>
                )}
              </div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="mt-0.5 text-xs text-slate-500">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${card} lg:col-span-2`}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Revenue Overview</h3>
              <p className="mt-0.5 text-xs text-slate-500">Last 6 months from CSV credits and debits</p>
            </div>
            <div className="flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-400" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400" />Expenses</span>
            </div>
          </div>
          <LineChartSvg data={data.revenueData} />
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-white/6 bg-white/[0.03] p-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-black/10 px-3 py-2">
              <span className="text-xs font-medium text-slate-500">Rs</span>
              <input value={entryAmount} onChange={e => setEntryAmount(e.target.value.replace(/[^0-9]/g, ""))} className="min-w-0 flex-1 bg-transparent text-sm text-slate-200 outline-none" />
            </div>
            <button onClick={() => submitLive("sale")} className="flex items-center gap-2 rounded-lg bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-300"><Plus className="h-3.5 w-3.5" /> Add sale</button>
            <button onClick={() => submitLive("expense")} className="flex items-center gap-2 rounded-lg bg-red-400/10 px-3 py-2 text-xs font-medium text-red-300"><Minus className="h-3.5 w-3.5" /> Add expense</button>
            <button onClick={() => submitLive("collection")} className="rounded-lg bg-violet-600/20 px-3 py-2 text-xs font-medium text-violet-200">Mark collected</button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={card}>
          <h3 className="mb-4 font-semibold text-white">Business Health</h3>
          <div className="flex flex-col items-center py-4">
            <div className="relative mb-4 h-32 w-32">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1e1e2e" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#7c3aed" strokeWidth="8" strokeDasharray={`${2 * Math.PI * 40 * healthScore / 100} ${2 * Math.PI * 40}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{healthScore}</span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
            </div>
            <p className="text-center text-xs text-slate-500">Computed from cash flow, collections, and task load.</p>
          </div>
          {[
            { label: "Cash Flow", pct: cashFlowScore },
            { label: "Collections", pct: collectionsScore },
            { label: "Task Load", pct: taskScore },
          ].map(item => (
            <div key={item.label} className="mt-2">
              <div className="mb-1 flex justify-between text-xs text-slate-500"><span>{item.label}</span><span>{item.pct}%</span></div>
              <div className="h-1.5 rounded-full bg-white/5"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${item.pct}%` }} /></div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
