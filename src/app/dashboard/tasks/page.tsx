"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, CheckCircle2, Circle, Clock, Plus, Tag } from "lucide-react";
import { useBusinessData } from "@/lib/useBusinessData";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

const MANUAL_TASKS_KEY = "agentpay_tasks";

const PRIORITY_STYLES = {
  high: "text-red-400 bg-red-400/10 border-red-400/20",
  medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  low: "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

const STATUS_ICON = {
  done: CheckCircle2,
  "in-progress": Clock,
  todo: Circle,
};

const STATUS_COLOR = {
  done: "text-emerald-400",
  "in-progress": "text-violet-300",
  todo: "text-slate-500",
};

function TaskCard({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const Icon = STATUS_ICON[task.status];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onToggle(task.id)}
      className={cn("cursor-pointer rounded-xl border bg-[#12121a] p-4 transition", task.status === "done" ? "border-white/4 opacity-60" : "border-white/6 hover:border-violet-500/25")}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 h-4 w-4 flex-shrink-0", STATUS_COLOR[task.status])} />
        <div className="min-w-0 flex-1">
          <div className={cn("mb-1 text-sm font-medium", task.status === "done" ? "text-slate-500 line-through" : "text-white")}>{task.title}</div>
          <p className="mb-3 text-xs leading-relaxed text-slate-600">{task.description}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize", PRIORITY_STYLES[task.priority])}>{task.priority}</span>
            <span className="flex items-center gap-1 text-[10px] text-slate-600"><Tag className="h-3 w-3" />{task.category}</span>
            <span className="ml-auto flex items-center gap-1 text-[10px] text-slate-600"><Calendar className="h-3 w-3" />{task.dueDate}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

type FilterType = "all" | "todo" | "in-progress" | "done";

export default function TasksPage() {
  const { data } = useBusinessData();
  const [filter, setFilter] = useState<FilterType>("all");
  const [manualTasks, setManualTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");

  useEffect(() => {
    const saved = localStorage.getItem(MANUAL_TASKS_KEY);
    setManualTasks(saved ? JSON.parse(saved) : []);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(MANUAL_TASKS_KEY, JSON.stringify(manualTasks));
  }, [loaded, manualTasks]);

  const tasks = useMemo(() => [...data.tasks, ...manualTasks], [data.tasks, manualTasks]);

  const addTask = () => {
    if (!title.trim()) return;
    const newTask: Task = {
      id: `manual-task-${Date.now()}`,
      title: title.trim(),
      description: "Manual task added by the operator.",
      priority,
      status: "todo",
      dueDate: new Date().toISOString().slice(0, 10),
      category: "Manual",
    };
    setManualTasks(previous => [newTask, ...previous]);
    setTitle("");
    setPriority("medium");
  };

  const toggleTask = (id: string) => {
    setManualTasks(previous => previous.map(task => {
      if (task.id !== id) return task;
      const nextStatus: Task["status"] = task.status === "todo" ? "in-progress" : task.status === "in-progress" ? "done" : "todo";
      return { ...task, status: nextStatus };
    }));
  };

  const visibleTasks = filter === "all" ? tasks : tasks.filter(task => task.status === filter);
  const highPriority = tasks.filter(task => task.priority === "high" && task.status !== "done").length;
  const tabs: { label: string; value: FilterType; count: number }[] = [
    { label: "All", value: "all", count: tasks.length },
    { label: "To Do", value: "todo", count: tasks.filter(task => task.status === "todo").length },
    { label: "In Progress", value: "in-progress", count: tasks.filter(task => task.status === "in-progress").length },
    { label: "Done", value: "done", count: tasks.filter(task => task.status === "done").length },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      {highPriority > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-300">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          {highPriority} high-priority CSV task{highPriority === 1 ? "" : "s"} need attention
        </div>
      )}

      <div className="rounded-2xl border border-white/6 bg-[#12121a] p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input value={title} onChange={event => setTitle(event.target.value)} onKeyDown={event => event.key === "Enter" && addTask()} placeholder="Add a new task..." className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-violet-500/40" />
          <select value={priority} onChange={event => setPriority(event.target.value as Task["priority"])} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-violet-500/40">
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button onClick={addTask} className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white">
            <Plus className="h-4 w-4" /> Add task
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-600">Generated tasks come from CSV rules. Manual tasks are stored in localStorage.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button key={tab.value} onClick={() => setFilter(tab.value)} className={cn("flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition", filter === tab.value ? "border-violet-500/30 bg-violet-600/20 text-violet-200" : "border-white/8 bg-white/5 text-slate-400")}>
            {tab.label}<span className="rounded-full bg-white/10 px-1.5 py-0.5 text-xs">{tab.count}</span>
          </button>
        ))}
      </div>

      <motion.div className="space-y-3" layout>
        <AnimatePresence mode="popLayout">
          {visibleTasks.map(task => <TaskCard key={task.id} task={task} onToggle={toggleTask} />)}
        </AnimatePresence>
        {visibleTasks.length === 0 && <div className="py-16 text-center text-sm text-slate-600">No tasks in this category.</div>}
      </motion.div>
    </div>
  );
}
