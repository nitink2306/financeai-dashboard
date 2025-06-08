export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  date: Date;
  type: "INCOME" | "EXPENSE";
  categoryId?: string;
  merchant?: string;
  receiptUrl?: string;
  isRecurring: boolean;
  confidence?: number;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  userId?: string;
  type: "INCOME" | "EXPENSE";
  createdAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  period: "WEEKLY" | "MONTHLY" | "YEARLY";
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  category: Category;
}

export interface Insight {
  id: string;
  userId: string;
  type:
    | "SPENDING_PATTERN"
    | "BUDGET_ALERT"
    | "SAVING_OPPORTUNITY"
    | "UNUSUAL_ACTIVITY"
    | "PREDICTION";
  title: string;
  content: string;
  data?: {
    spendingPattern?: { category: string; amount: number }[];
    budgetAlert?: { category: string; current: number; limit: number };
    savingOpportunity?: { amount: number; reason: string };
    unusualActivity?: { transaction: Transaction; deviation: number };
    prediction?: { amount: number; confidence: number };
  };
  priority: number;
  isRead: boolean;
  createdAt: Date;
}

export interface User {
  id: string;
  name?: string;
  email: string;
  image?: string;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
  topCategory: string;
  budgetUtilization: number;
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
  income?: number;
  expenses?: number;
}

export interface AIInsight {
  category: string;
  confidence: number;
  reasoning: string;
  suggestions?: string[];
}
