"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowUpDown } from "lucide-react";
import { useBusinessData } from "@/lib/useBusinessData";
import { cn, formatCurrency } from "@/lib/utils";

type FilterType = "all" | "income" | "expense" | "active" | "inactive";

const STATUS_STYLES = {
  active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  inactive: "text-slate-500 bg-slate-500/10 border-slate-500/20",
  vip: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

export default function CustomersPage() {
  const { data } = useBusinessData();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = data.customers.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "income" && entity.type === "Income Source") ||
      (filter === "expense" && entity.type === "Expense Payee") ||
      entity.status === filter;
    return matchesSearch && matchesFilter;
  });

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Income Sources", value: "income" },
    { label: "Expense Payees", value: "expense" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search descriptions..."
            className="w-full rounded-xl border border-white/10 bg-[#12121a] py-2.5 pl-9 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-violet-500/40"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map(item => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={cn("rounded-lg border px-3 py-2 text-xs font-medium transition",
                filter === item.value
                  ? "border-violet-500/30 bg-violet-600/20 text-violet-200"
                  : "border-white/8 bg-white/5 text-slate-400 hover:bg-white/8"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden rounded-2xl border border-white/6 bg-[#12121a]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px]">
            <thead>
              <tr className="border-b border-white/6">
                {["Name", "Type", "Total Amount", "Frequency", "Last Seen", "Status"].map(header => (
                  <th key={header} className="px-5 py-3.5 text-left text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1">{header}<ArrowUpDown className="h-3 w-3 opacity-30" /></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entity, index) => (
                <motion.tr
                  key={entity.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-white/4 last:border-0"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-500/20 bg-violet-600/20 text-xs font-bold text-violet-200">
                        {entity.name[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-white">{entity.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">{entity.type}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-cyan-300">{formatCurrency(entity.spent)}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-400">{entity.orders}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">{entity.lastSeen}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn("rounded-full border px-2 py-0.5 text-[11px] capitalize", STATUS_STYLES[entity.status])}>
                      {entity.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-12 text-center text-sm text-slate-600">No entities match your filters.</div>}
        </div>
      </motion.div>

      <div className="text-right text-xs text-slate-600">{filtered.length} of {data.customers.length} derived entities</div>
    </div>
  );
}
