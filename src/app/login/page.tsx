"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { MERCHANT } from "@/lib/merchant";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("priya@bloomkitchen.in");
  const [password, setPassword] = useState("demo1234");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("agentpay_merchant", JSON.stringify(MERCHANT));
      router.push("/dashboard");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[20%] w-[300px] h-[300px] rounded-full bg-violet-600/8 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 border border-white/8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-white text-xl">AgentPay</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-slate-400 text-sm mb-8">Sign in to your merchant dashboard</p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all pr-10"
                />
                <button
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input type="checkbox" className="rounded" defaultChecked />
                Remember me
              </label>
              <button className="text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</button>
            </div>

            <motion.button
              onClick={handleLogin}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-70"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-indigo-500/8 border border-indigo-500/15">
            <p className="text-xs text-indigo-300 font-medium mb-1">Demo credentials</p>
            <p className="text-xs text-slate-400">Email: priya@bloomkitchen.in</p>
            <p className="text-xs text-slate-400">Password: demo1234</p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          <Link href="/" className="hover:text-slate-400 transition-colors">Back to home</Link>
        </p>
      </motion.div>
    </div>
  );
}
