"use client";
import { motion } from "framer-motion";
import { ArrowRight, Zap, TrendingUp, Shield, Bot, ChevronRight } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Bot,
    title: "AI Copilot",
    desc: "Ask anything about invoices, cash flow gaps, overdue payments, and customer follow-ups. Get instant answers and suggested actions.",
    color: "from-indigo-500 to-violet-500",
  },
  {
    icon: TrendingUp,
    title: "Revenue Intelligence",
    desc: "Real-time profit, expense breakdowns, customer value, and growth trends in one clean dashboard built for founders.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Shield,
    title: "Smart Compliance",
    desc: "GST reminders, invoice aging, tax summaries, and audit-ready reports generated before the owner has to ask.",
    color: "from-purple-500 to-indigo-500",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#0a0a0f]">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.12),transparent_38%),radial-gradient(circle_at_75%_85%,rgba(139,92,246,0.08),transparent_30%)]" />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
            <Zap className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">AgentPay</span>
        </Link>
        <Link href="/login">
          <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition-all hover:bg-white/10">
            Sign in <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </Link>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-28 pt-24 text-center sm:px-8">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-400">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Paytm Hackathon Track 3 - AI for Small Business
          </div>

          <h1 className="mx-auto max-w-5xl text-5xl font-bold leading-[1.08] text-white sm:text-6xl lg:text-7xl">
            Your business finances,{" "}
            <span className="gradient-text">on autopilot.</span>
          </h1>
          <p className="mx-auto mb-10 mt-7 max-w-2xl text-lg leading-8 text-slate-400">
            AgentPay is an AI copilot that handles invoicing, cash flow analysis, customer payments, and financial reporting so small business owners can focus on growth.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 font-medium text-white transition-all hover:opacity-90 glow"
              >
                Start free trial <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
            <Link href="/login">
              <button className="rounded-xl border border-white/10 px-6 py-3.5 font-medium text-slate-300 transition-all hover:bg-white/5">
                Watch 2-min demo
              </button>
            </Link>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative mt-20"
        >
          <div className="glass glow mx-auto max-w-4xl rounded-2xl border border-white/10 p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <div className="h-3 w-3 rounded-full bg-green-500/70" />
              <div className="mx-2 flex h-6 flex-1 items-center rounded-md bg-white/5 px-3 sm:mx-4">
                <span className="text-xs text-slate-600">app.agentpay.in/dashboard</span>
              </div>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["CSV", "Revenue"],
                ["Live", "Entities"],
                ["Synced", "Reports"],
                ["AI", "Tasks"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-white/5 bg-white/[0.03] p-3 text-left">
                  <div className="mb-1 text-xs text-slate-500">{label}</div>
                  <div className="text-sm font-semibold text-white">{value}</div>
                </div>
              ))}
            </div>
            <div className="flex h-36 items-end gap-2 rounded-lg border border-white/5 bg-gradient-to-r from-indigo-500/10 to-violet-500/5 px-4 pb-3">
              {[40, 60, 45, 70, 55, 80, 75, 92].map((height, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-sm bg-gradient-to-t from-indigo-500 to-violet-500 opacity-75"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </motion.section>

        <section className="mt-24 grid gap-6 text-left md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -4 }}
              className="glass glass-hover rounded-2xl p-6"
            >
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color}`}>
                <feature.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{feature.desc}</p>
            </motion.div>
          ))}
        </section>
      </main>
    </div>
  );
}
