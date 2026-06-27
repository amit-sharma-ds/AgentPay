"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AreaChartSvg, BarChartSvg, DonutSvg } from "@/app/dashboard/SvgCharts";
import { useBusinessData } from "@/lib/useBusinessData";
import { formatCurrency } from "@/lib/utils";

const card = "rounded-2xl border border-white/6 bg-[#12121a] p-5";

export default function AnalyticsPage() {
  const { data, addTransaction } = useBusinessData();
  const [amount, setAmount] = useState("");
  const totalRevenue = data.transactions.filter(tx => tx.type === "CR").reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpenses = data.transactions.filter(tx => tx.type === "DR").reduce((sum, tx) => sum + tx.amount, 0);
  const totalProfit = totalRevenue - totalExpenses;

  const submit = (kind: "sale" | "expense") => {
    const value = Math.max(0, Number(amount) || 0);
    addTransaction(kind, value);
  };

  return (
    <div className="max-w-7xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Revenue (H1)", value: formatCurrency(totalRevenue), color: "text-cyan-300" },
          { label: "Total Expenses (H1)", value: formatCurrency(totalExpenses), color: "text-red-300" },
          { label: "Net Profit (H1)", value: formatCurrency(totalProfit), color: totalProfit >= 0 ? "text-emerald-300" : "text-red-300" },
        ].map((item, index) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className={card}>
            <div className="mb-2 text-xs text-slate-500">{item.label}</div>
            <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/6 bg-[#12121a] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Live chart demo</h3>
            <p className="mt-1 text-xs text-slate-500">Add a credit or debit; all tabs recalculate from localStorage.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-xs text-slate-500">Rs</span>
              <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ""))} className="w-24 bg-transparent text-xs text-slate-200 outline-none" />
            </div>
            <button onClick={() => submit("sale")} className="rounded-lg bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-300">Add sale</button>
            <button onClick={() => submit("expense")} className="rounded-lg bg-red-400/10 px-3 py-2 text-xs font-medium text-red-300">Add expense</button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${card} lg:col-span-2`}>
          <h3 className="mb-1 font-semibold text-white">Revenue vs Expenses</h3>
          <p className="mb-5 text-xs text-slate-500">Monthly comparison from CSV</p>
          <BarChartSvg data={data.revenueData} />
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={card}>
          <h3 className="mb-1 font-semibold text-white">Expense Breakdown</h3>
          <p className="mb-4 text-xs text-slate-500">By Category column</p>
          <DonutSvg data={data.expenseBreakdown} />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={card}>
        <h3 className="mb-1 font-semibold text-white">Net Trend</h3>
        <p className="mb-5 text-xs text-slate-500">Credits minus debits over time</p>
        <AreaChartSvg data={data.revenueData} />
      </motion.div>
    </div>
  );
}
