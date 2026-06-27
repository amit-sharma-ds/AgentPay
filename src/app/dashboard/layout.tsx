"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap, LayoutDashboard, Bot, BarChart2, Users, CheckSquare, FileText,
  LogOut, Menu, X, Bell, Search, FileSpreadsheet
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/copilot", label: "Copilot", icon: Bot },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
  { href: "/dashboard/csv", label: "Transaction Analysis", icon: FileSpreadsheet },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitle = NAV.find(n => n.href === pathname)?.label ?? "Dashboard";

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Sidebar */}
      <>
        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-20 bg-black/60 md:hidden"
            />
          )}
        </AnimatePresence>

        <motion.aside
          className={`fixed md:relative z-30 h-full w-60 flex-shrink-0 flex flex-col glass border-r border-white/6
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-200`}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">AgentPay</span>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto md:hidden text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href} onClick={() => setSidebarOpen(false)}>
                  <motion.div
                    whileHover={{ x: 2 }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${active
                        ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                    {label === "Copilot" && (
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">AI</span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div className="px-3 pb-4 border-t border-white/6 pt-3">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                PS
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">Priya Sharma</div>
                <div className="text-[10px] text-slate-500">Pro Plan</div>
              </div>
              <Link href="/">
                <LogOut className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </Link>
            </div>
          </div>
        </motion.aside>
      </>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-white/6 bg-[#0a0a0f]/80 backdrop-blur-sm flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-semibold text-white text-base">{pageTitle}</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-slate-500 text-xs">
              <Search className="w-3.5 h-3.5" />
              <span>Search...</span>
            </div>
            <button className="relative w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
