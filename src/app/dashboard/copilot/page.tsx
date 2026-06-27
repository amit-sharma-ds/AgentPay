"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, ChevronDown, Send, User } from "lucide-react";
import { useBusinessData } from "@/lib/useBusinessData";
import { cn, formatCurrency } from "@/lib/utils";
import type { ChatMessage } from "@/types";

const QUICK_PROMPTS = ["Show invoice status", "Analyze cash flow", "Top customers report", "Generate Q2 report"];

let msgId = 1;

const answerFromData = (prompt: string, summary: string, data: ReturnType<typeof useBusinessData>["data"]) => {
  const lower = prompt.toLowerCase();
  const revenue = data.transactions.filter(tx => tx.type === "CR").reduce((sum, tx) => sum + tx.amount, 0);
  const expenses = data.transactions.filter(tx => tx.type === "DR").reduce((sum, tx) => sum + tx.amount, 0);
  const topCustomer = data.customers[0];
  const topExpense = data.expenseBreakdown[0];

  if (lower.includes("invoice") || lower.includes("pending")) {
    return `Invoice status: pending DR amount is ${formatCurrency(data.pendingAmount)}. I found ${data.tasks.length} action item${data.tasks.length === 1 ? "" : "s"} from the current CSV.`;
  }
  if (lower.includes("cash")) {
    return `Cash flow from the uploaded CSV is ${formatCurrency(revenue - expenses)}. Credits are ${formatCurrency(revenue)} and debits are ${formatCurrency(expenses)} across ${data.dateRange}.`;
  }
  if (lower.includes("customer")) {
    return topCustomer ? `Top customer is ${topCustomer.name} with ${formatCurrency(topCustomer.spent)} across ${topCustomer.orders} credit transaction${topCustomer.orders === 1 ? "" : "s"}.` : "No customer names were present, so I grouped credits under Paytm.";
  }
  if (lower.includes("report") || lower.includes("q2")) {
    return `Q2-style summary generated from current data:\n${summary}`;
  }
  if (topExpense) {
    return `I analyzed the current CSV. Biggest debit category is ${topExpense.name} at ${topExpense.value}%. Net position is ${formatCurrency(revenue - expenses)}.`;
  }
  return `I analyzed the current CSV.\n${summary}`;
};

export default function CopilotPage() {
  const { data } = useBusinessData();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{
      id: "msg0",
      role: "assistant",
      content: `Hi Priya. I am AgentPay Copilot for ${data.businessName}. I can answer using the current CSV: ${data.transactions.length} transactions from ${data.dateRange}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
  }, [data.businessName, data.transactions.length, data.dateRange]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || typing) return;
    const userMsg: ChatMessage = {
      id: `msg${++msgId}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    const fallback = answerFromData(text, data.summaryText, data);
    const response = await fetch("/api/ai-summary", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        prompt: text,
        context: `${data.summaryText}\n\nFallback answer style:\n${fallback}`,
      }),
    }).catch(() => null);
    const ai = response ? await response.json().catch(() => ({ summary: "" })) : { summary: "" };
    setTyping(false);
    setMessages(prev => [...prev, {
      id: `msg${++msgId}`,
      role: "assistant",
      content: ai.summary || fallback,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-100px)] max-w-4xl flex-col">
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/6 bg-[#12121a] p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">AgentPay Copilot</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Online / Powered by AgentAI
          </div>
        </div>
        <button className="ml-auto flex items-center gap-1 text-xs text-slate-500">
          Model: AgentAI-4 <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pb-2 pr-1">
        {messages.map(msg => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
            <div className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full", msg.role === "assistant" ? "bg-violet-600" : "border border-white/10 bg-white/10")}>
              {msg.role === "assistant" ? <Bot className="h-4 w-4 text-white" /> : <User className="h-4 w-4 text-slate-300" />}
            </div>
            <div className={cn("max-w-[78%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm", msg.role === "user" ? "rounded-tr-sm border border-violet-500/30 bg-violet-600/25 text-slate-200" : "rounded-tl-sm border border-white/6 bg-[#12121a] text-slate-200")}>
              {msg.content}
              <div className="mt-2 text-[10px] text-slate-600">{msg.timestamp}</div>
            </div>
          </motion.div>
        ))}
        {typing && <div className="text-sm text-slate-500">AgentAI is reading CSV context...</div>}
        <div ref={bottomRef} />
      </div>

      <div className="my-3 flex flex-wrap gap-2">
        {QUICK_PROMPTS.map(prompt => (
          <button key={prompt} onClick={() => sendMessage(prompt)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition hover:border-violet-500/40 hover:text-slate-200">
            {prompt}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage(input)} placeholder="Ask about invoices, cash flow, customers..." className="flex-1 rounded-xl border border-white/10 bg-[#12121a] px-4 py-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-violet-500/40" />
        <button onClick={() => sendMessage(input)} disabled={!input.trim() || typing} className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white disabled:opacity-40">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
