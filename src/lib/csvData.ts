import type { RevenueData, Task } from "@/types";

export const TRANSACTIONS_STORAGE_KEY = "agentpay_transactions";
export const CSV_FILE_NAME_KEY = "agentpay_source_name";
export const SEED_CSV_PATH = "/paytm_7weeks.csv";

export type AgentTransactionType = "CR" | "DR";

export interface AgentTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: AgentTransactionType;
  category: string;
  customer: string;
  status: "completed" | "pending" | "failed";
  balance?: number;
}

export interface CustomerSummary {
  id: string;
  name: string;
  type: "Income Source" | "Expense Payee";
  spent: number;
  orders: number;
  status: "active" | "inactive" | "vip";
  joinedDate: string;
  lastSeen: string;
}

export interface BusinessData {
  businessName: string;
  transactions: AgentTransaction[];
  revenueData: RevenueData[];
  customers: CustomerSummary[];
  tasks: Task[];
  expenseBreakdown: { name: string; value: number; amount: number; color: string }[];
  pendingAmount: number;
  activeCustomerCount: number;
  sourceName?: string;
  summaryText: string;
  dateRange: string;
}

type CsvRow = Record<string, string>;

const COLORS = ["#06b6d4", "#7c3aed", "#10b981", "#ef4444", "#f59e0b", "#84cc16", "#ec4899"];
const MONTH_FORMATTER = new Intl.DateTimeFormat("en", { month: "short" });

const normalizeKey = (key: string) => key.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

const getValue = (row: CsvRow, keys: string[]) => {
  const normalized = Object.fromEntries(Object.entries(row).map(([key, value]) => [normalizeKey(key), value]));
  return keys.map(normalizeKey).map(key => normalized[key]).find(Boolean)?.trim() ?? "";
};

const parseAmount = (value: string) => {
  const amount = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(amount) ? Math.abs(amount) : 0;
};

export const parseDate = (value: string) => {
  const trimmed = value.trim();
  const dayFirst = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  const normalized = dayFirst ? `${dayFirst[3]}-${dayFirst[2]}-${dayFirst[1]}` : trimmed;
  const date = normalized ? new Date(normalized) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const toIsoDate = (value: string) => parseDate(value).toISOString().slice(0, 10);

const inferType = (row: CsvRow, amountValue: string): AgentTransactionType => {
  const explicit = getValue(row, ["type", "transaction_type", "kind", "crdr", "debit_credit"]).toLowerCase();
  if (["cr", "credit", "income", "revenue", "sale", "received"].some(token => explicit.includes(token))) return "CR";
  if (["dr", "debit", "expense", "paid", "purchase"].some(token => explicit.includes(token))) return "DR";
  return amountValue.trim().startsWith("-") ? "DR" : "CR";
};

const inferStatus = (value: string): AgentTransaction["status"] => {
  const status = value.toLowerCase();
  if (status.includes("fail") || status.includes("cancel")) return "failed";
  if (status.includes("pend") || status.includes("due") || status.includes("open") || status.includes("unpaid")) return "pending";
  return "completed";
};

const parseCsvLine = (line: string) => {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
};

export const parseTransactionsCsv = (csv: string): AgentTransaction[] => {
  const lines = csv.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const row = headers.reduce<CsvRow>((acc, header, headerIndex) => {
      acc[header] = values[headerIndex] ?? "";
      return acc;
    }, {});
    const amountValue = getValue(row, ["amount", "value", "total", "paid", "price", "net_amount"]);
    const type = inferType(row, amountValue);
    const customer = getValue(row, ["customer", "customer_name", "client", "client_name", "name"]) || "Paytm";

    return {
      id: getValue(row, ["id", "transaction_id", "invoice_id"]) || `tx-${toIsoDate(getValue(row, ["date", "transaction_date"]))}-${index + 1}`,
      date: toIsoDate(getValue(row, ["date", "transaction_date", "created_at", "paid_at", "due_date"])),
      description: getValue(row, ["description", "details", "memo", "item", "particulars"]) || `${type === "CR" ? "Credit" : "Debit"} transaction`,
      amount: parseAmount(amountValue),
      type,
      category: getValue(row, ["category", "account", "expense_category", "income_category"]) || (type === "CR" ? "Income" : "Operations"),
      customer,
      status: inferStatus(getValue(row, ["status", "payment_status", "invoice_status"])),
      balance: parseAmount(getValue(row, ["balance", "closing_balance"])),
    };
  }).filter(tx => tx.amount > 0);
};

export const mergeTransactions = (existing: AgentTransaction[], incoming: AgentTransaction[]) => {
  const seen = new Set<string>();
  return [...existing, ...incoming]
    .filter(tx => {
      const key = `${tx.date}|${tx.description}|${tx.amount}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
};

const monthKey = (date: string) => {
  const parsed = parseDate(date);
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
};

export const buildRevenueData = (transactions: AgentTransaction[]): RevenueData[] => {
  const grouped = new Map<string, RevenueData & { sortKey: string }>();

  transactions.forEach(tx => {
    const key = monthKey(tx.date);
    const date = parseDate(tx.date);
    const existing = grouped.get(key) ?? {
      sortKey: key,
      month: MONTH_FORMATTER.format(date),
      revenue: 0,
      expenses: 0,
      profit: 0,
    };
    if (tx.type === "CR") existing.revenue += tx.amount;
    else existing.expenses += tx.amount;
    existing.profit = existing.revenue - existing.expenses;
    grouped.set(key, existing);
  });

  return Array.from(grouped.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey)).slice(-6).map(({ sortKey, ...item }) => item);
};

export const buildExpenseBreakdown = (transactions: AgentTransaction[]) => {
  const debitRows = transactions.filter(tx => tx.type === "DR");
  const total = debitRows.reduce((sum, tx) => sum + tx.amount, 0);
  if (total === 0) return [{ name: "No debits", value: 100, amount: 0, color: COLORS[0] }];

  const grouped = new Map<string, number>();
  debitRows.forEach(tx => grouped.set(tx.category, (grouped.get(tx.category) ?? 0) + tx.amount));

  return Array.from(grouped.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, amount], index) => ({
      name,
      amount,
      value: Math.round((amount / total) * 100),
      color: COLORS[index % COLORS.length],
    }));
};

export const buildCustomers = (transactions: AgentTransaction[]): CustomerSummary[] => {
  const grouped = new Map<string, CustomerSummary>();
  const latestDate = transactions.reduce((latest, tx) => Math.max(latest, parseDate(tx.date).getTime()), 0);

  transactions.filter(tx => tx.type === "DR" || !/salary/i.test(tx.description)).forEach(tx => {
    const entityType: CustomerSummary["type"] = tx.type === "CR" ? "Income Source" : "Expense Payee";
    const key = `${entityType}-${tx.description}`.toLowerCase();
    const existing = grouped.get(key) ?? {
      id: `customer-${grouped.size + 1}`,
      name: tx.description,
      type: entityType,
      spent: 0,
      orders: 0,
      status: "active",
      joinedDate: tx.date,
      lastSeen: tx.date,
    };
    existing.spent += tx.amount;
    existing.orders += 1;
    existing.joinedDate = existing.joinedDate < tx.date ? existing.joinedDate : tx.date;
    existing.lastSeen = existing.lastSeen > tx.date ? existing.lastSeen : tx.date;
    const daysSinceLastSeen = latestDate > 0 ? (latestDate - parseDate(existing.lastSeen).getTime()) / 86400000 : 0;
    existing.status = daysSinceLastSeen <= 14 ? "active" : "inactive";
    grouped.set(key, existing);
  });

  return Array.from(grouped.values()).sort((a, b) => b.spent - a.spent);
};

export const buildGeneratedTasks = (transactions: AgentTransaction[]): Task[] => {
  const tasks: Task[] = [];
  const sorted = transactions.slice().sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
  const groupedByDescription = transactions.reduce((map, tx) => {
    const key = tx.description.toLowerCase();
    map.set(key, [...(map.get(key) ?? []), tx]);
    return map;
  }, new Map<string, AgentTransaction[]>());

  transactions.filter(tx => tx.type === "DR" && tx.amount > 1000).slice(0, 8).forEach((tx, index) => {
    tasks.push({
      id: `task-large-expense-${index}`,
      title: `Review large expense: ${tx.description} Rs ${tx.amount.toLocaleString("en-IN")}`,
      description: `${tx.category} debit on ${tx.date} crossed the large-expense threshold.`,
      priority: "medium",
      status: "todo",
      dueDate: tx.date,
      category: tx.category,
    });
  });

  Array.from(groupedByDescription.entries()).filter(([, rows]) => rows.length >= 3).slice(0, 8).forEach(([description, rows], index) => {
    const latest = rows.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
    tasks.push({
      id: `task-recurring-${index}`,
      title: `Recurring spend detected: ${latest.description}`,
      description: `${rows.length} transactions found for this description.`,
      priority: "medium",
      status: "todo",
      dueDate: latest.date,
      category: latest.category || description,
    });
  });

  const creditDates = sorted.filter(tx => tx.type === "CR").map(tx => parseDate(tx.date).getTime());
  const largestCreditGap = creditDates.slice(1).reduce((largest, current, index) => {
    const gap = (current - creditDates[index]) / 86400000;
    return Math.max(largest, gap);
  }, 0);

  if (largestCreditGap > 10) {
    tasks.push({
      id: "task-income-gap",
      title: "No income in last 10 days - check pending receivables",
      description: `Largest CREDIT gap in the CSV is ${Math.round(largestCreditGap)} days.`,
      priority: "high",
      status: "todo",
      dueDate: sorted.at(-1)?.date ?? new Date().toISOString().slice(0, 10),
      category: "Income",
    });
  }

  Array.from(groupedByDescription.values())
    .filter(rows => /electricity bill/i.test(rows[0]?.description ?? ""))
    .forEach((rows, index) => {
      const byWeek = rows.reduce((map, tx) => {
        const date = parseDate(tx.date);
        const week = `${date.getFullYear()}-${Math.ceil((((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000) + 1) / 7)}`;
        map.set(week, [...(map.get(week) ?? []), tx]);
        return map;
      }, new Map<string, AgentTransaction[]>());
      const duplicateWeek = Array.from(byWeek.values()).find(weekRows => weekRows.length > 1);
      if (!duplicateWeek) return;
      tasks.push({
        id: `task-duplicate-utility-${index}`,
        title: "Duplicate utility payment?",
        description: `Electricity Bill appears ${duplicateWeek.length} times in the same week.`,
        priority: "high",
        status: "todo",
        dueDate: duplicateWeek[0].date,
        category: "Utilities",
      });
    });

  return tasks;
};

const formatRange = (transactions: AgentTransaction[]) => {
  if (transactions.length === 0) return "No data";
  const sorted = transactions.slice().sort((a, b) => a.date.localeCompare(b.date));
  return `${sorted[0].date} to ${sorted[sorted.length - 1].date}`;
};

export const buildBusinessData = (transactions: AgentTransaction[], sourceName?: string): BusinessData => {
  const revenueData = buildRevenueData(transactions);
  const customers = buildCustomers(transactions);
  const expenseBreakdown = buildExpenseBreakdown(transactions);
  const tasks = buildGeneratedTasks(transactions);
  const totalRevenue = transactions.filter(tx => tx.type === "CR").reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpenses = transactions.filter(tx => tx.type === "DR").reduce((sum, tx) => sum + tx.amount, 0);
  const pendingAmount = transactions.filter(tx => tx.type === "DR" && tx.status === "pending").reduce((sum, tx) => sum + tx.amount, 0);
  const topCustomers = customers.slice(0, 3).map(customer => `${customer.name}: Rs ${customer.spent.toLocaleString("en-IN")}`).join(", ") || "No customers";
  const expenseMix = expenseBreakdown.map(item => `${item.name}: ${item.value}%`).join(", ");

  return {
    businessName: "Bloom Kitchen",
    transactions,
    revenueData,
    customers,
    tasks,
    expenseBreakdown,
    pendingAmount,
    activeCustomerCount: customers.filter(customer => customer.status !== "inactive").length,
    sourceName,
    dateRange: formatRange(transactions),
    summaryText: [
      `Business: Bloom Kitchen`,
      `Date range: ${formatRange(transactions)}`,
      `Transactions: ${transactions.length}`,
      `Total revenue/credits: Rs ${totalRevenue.toLocaleString("en-IN")}`,
      `Total expenses/debits: Rs ${totalExpenses.toLocaleString("en-IN")}`,
      `Net profit/cash flow: Rs ${(totalRevenue - totalExpenses).toLocaleString("en-IN")}`,
      `Pending DR amount: Rs ${pendingAmount.toLocaleString("en-IN")}`,
      `Top customers: ${topCustomers}`,
      `Expense breakdown: ${expenseMix}`,
    ].join("\n"),
  };
};
