"use client";

import type { RevenueData } from "@/types";
import { formatCurrency } from "@/lib/utils";

const width = 640;
const height = 220;
const pad = 28;

const pointsFor = (data: RevenueData[], key: keyof Pick<RevenueData, "revenue" | "expenses" | "profit">) => {
  const values = data.map(item => item[key]);
  const max = Math.max(...data.flatMap(item => [item.revenue, item.expenses, Math.abs(item.profit)]), 1);
  return values.map((value, index) => {
    const x = pad + (index * (width - pad * 2)) / Math.max(data.length - 1, 1);
    const y = height - pad - ((value + (key === "profit" && value < 0 ? max : 0)) / (key === "profit" ? max * 2 : max)) * (height - pad * 2);
    return `${x},${Number.isFinite(y) ? y : height - pad}`;
  }).join(" ");
};

export function LineChartSvg({ data }: { data: RevenueData[] }) {
  if (data.length === 0) return <div className="flex h-[220px] items-center justify-center text-sm text-slate-600">No transaction data</div>;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full overflow-visible">
      <line x1={pad} x2={width - pad} y1={height - pad} y2={height - pad} stroke="rgba(255,255,255,0.08)" />
      <polyline fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={pointsFor(data, "revenue")} />
      <polyline fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={pointsFor(data, "expenses")} />
      {data.map((item, index) => {
        const x = pad + (index * (width - pad * 2)) / Math.max(data.length - 1, 1);
        return <text key={item.month} x={x} y={height - 6} textAnchor="middle" className="fill-slate-500 text-[11px]">{item.month}</text>;
      })}
    </svg>
  );
}

export function BarChartSvg({ data }: { data: RevenueData[] }) {
  const max = Math.max(...data.flatMap(item => [item.revenue, item.expenses]), 1);
  const slot = (width - pad * 2) / Math.max(data.length, 1);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[240px] w-full overflow-visible">
      <line x1={pad} x2={width - pad} y1={height - pad} y2={height - pad} stroke="rgba(255,255,255,0.08)" />
      {data.map((item, index) => {
        const x = pad + index * slot + slot * 0.25;
        const revH = (item.revenue / max) * (height - pad * 2);
        const expH = (item.expenses / max) * (height - pad * 2);
        return (
          <g key={item.month}>
            <rect x={x} y={height - pad - revH} width={slot * 0.2} height={revH} rx="4" fill="#06b6d4" />
            <rect x={x + slot * 0.25} y={height - pad - expH} width={slot * 0.2} height={expH} rx="4" fill="#ef4444" />
            <text x={x + slot * 0.22} y={height - 6} textAnchor="middle" className="fill-slate-500 text-[11px]">{item.month}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function AreaChartSvg({ data }: { data: RevenueData[] }) {
  if (data.length === 0) return <div className="flex h-[220px] items-center justify-center text-sm text-slate-600">No transaction data</div>;
  const pts = pointsFor(data, "profit");
  const first = pts.split(" ")[0] ?? `${pad},${height - pad}`;
  const last = pts.split(" ").at(-1) ?? `${width - pad},${height - pad}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full overflow-visible">
      <polygon points={`${first} ${pts} ${last.split(",")[0]},${height - pad} ${first.split(",")[0]},${height - pad}`} fill="rgba(124,58,237,0.2)" />
      <polyline fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={pts} />
      {data.map((item, index) => {
        const x = pad + (index * (width - pad * 2)) / Math.max(data.length - 1, 1);
        return <text key={item.month} x={x} y={height - 6} textAnchor="middle" className="fill-slate-500 text-[11px]">{item.month}</text>;
      })}
    </svg>
  );
}

export function DonutSvg({ data }: { data: { name: string; value: number; amount: number; color: string }[] }) {
  let offset = 25;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="16" />
        {data.map(item => {
          const dash = (item.value / 100) * circumference;
          const circle = (
            <circle
              key={item.name}
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth="16"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return circle;
        })}
      </svg>
      <div className="min-w-0 flex-1 space-y-2">
        {data.map(item => (
          <div key={item.name} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex min-w-0 items-center gap-2 text-slate-400">
              <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: item.color }} />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="text-slate-300">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MiniValue({ label, value }: { label: string; value: number }) {
  return <span>{label}: {formatCurrency(value)}</span>;
}
