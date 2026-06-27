export interface Merchant {
  id: string;
  name: string;
  email: string;
  plan: "Starter" | "Pro" | "Enterprise";
  avatar: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  status: "completed" | "pending" | "failed";
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  spent: number;
  orders: number;
  status: "active" | "inactive" | "vip";
  joinedDate: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "in-progress" | "done";
  dueDate: string;
  category: string;
}

export interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  agentSteps?: AgentStep[];
}

export interface AgentStep {
  id: string;
  label: string;
  status: "done" | "running" | "pending";
  detail?: string;
}

export interface StatCard {
  label: string;
  value: string;
  change: number;
  icon: string;
}
