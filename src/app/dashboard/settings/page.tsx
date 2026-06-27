"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Check } from "lucide-react";
import { MERCHANT } from "@/lib/merchant";

type Settings = {
  businessName: string;
  email: string;
  phone: string;
  gst: string;
  currency: string;
  timezone: string;
  emailNotifs: boolean;
  invoiceReminders: boolean;
  weeklyReport: boolean;
};

const DEFAULT: Settings = {
  businessName: "Bloom Kitchen Pvt Ltd",
  email: MERCHANT.email,
  phone: "+91 98765 43210",
  gst: "27AABCU9603R1ZN",
  currency: "INR",
  timezone: "Asia/Kolkata",
  emailNotifs: true,
  invoiceReminders: true,
  weeklyReport: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("agentpay_settings");
    if (stored) setSettings(JSON.parse(stored));
  }, []);

  const handleSave = () => {
    localStorage.setItem("agentpay_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (key: keyof Settings, val: string | boolean) =>
    setSettings(prev => ({ ...prev, [key]: val }));

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/40 transition-all";
  const labelClass = "block text-xs font-medium text-slate-400 mb-1.5";
  const card = "glass rounded-2xl border border-white/6 p-6";

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Business Info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={card}>
        <h3 className="font-semibold text-white mb-4">Business Information</h3>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Business Name</label>
              <input className={inputClass} value={settings.businessName} onChange={e => update("businessName", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>GST Number</label>
              <input className={inputClass} value={settings.gst} onChange={e => update("gst", e.target.value)} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email Address</label>
              <input className={inputClass} type="email" value={settings.email} onChange={e => update("email", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input className={inputClass} value={settings.phone} onChange={e => update("phone", e.target.value)} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Currency</label>
              <select className={inputClass} value={settings.currency} onChange={e => update("currency", e.target.value)}>
                <option>INR</option><option>USD</option><option>EUR</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Timezone</label>
              <select className={inputClass} value={settings.timezone} onChange={e => update("timezone", e.target.value)}>
                <option>Asia/Kolkata</option><option>UTC</option><option>America/New_York</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={card}>
        <h3 className="font-semibold text-white mb-4">Notifications</h3>
        <div className="space-y-4">
          {([
            { key: "emailNotifs", label: "Email notifications", desc: "Get notified when invoices are paid or overdue" },
            { key: "invoiceReminders", label: "Invoice reminders", desc: "Automatic payment reminders to customers" },
            { key: "weeklyReport", label: "Weekly summary", desc: "Receive a weekly business health report by email" },
          ] as const).map(({ key, label, desc }) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-slate-200 font-medium">{label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
              </div>
              <button
                onClick={() => update(key, !settings[key])}
                className={`w-11 h-6 rounded-full transition-all flex-shrink-0 relative ${settings[key] ? "bg-indigo-600" : "bg-white/10"}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings[key] ? "left-6" : "left-1"}`} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Plan */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={card}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white mb-0.5">Current Plan</h3>
            <p className="text-xs text-slate-500">Manage your subscription</p>
          </div>
          <div className="text-right">
            <div className="font-bold text-indigo-400">Pro</div>
            <div className="text-xs text-slate-500">Usage-based billing</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/6 flex gap-3">
          <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400 hover:bg-white/8 transition-all">View invoice history</button>
          <button className="px-4 py-2 rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-xs text-indigo-400 hover:bg-indigo-500/20 transition-all">Upgrade to Enterprise</button>
        </div>
      </motion.div>

      {/* Save */}
      <motion.button
        onClick={handleSave}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium text-sm hover:opacity-90 transition-all"
      >
        {saved ? <><Check className="w-4 h-4" />Saved!</> : <><Save className="w-4 h-4" />Save Changes</>}
      </motion.button>
    </div>
  );
}
