"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Brain,
  User,
  LogOut,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  AlertCircle,
  RefreshCw,
  Loader2,
  CheckCircle,
  Plus,
} from "lucide-react";

// Simple transaction interface
interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: "INCOME" | "EXPENSE";
  merchant?: string;
  category?: {
    name: string;
  };
}

// Utility functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

// Simple Add Transaction Modal Component
function AddTransactionModal({
  children,
  onTransactionAdded,
}: {
  children: React.ReactNode;
  onTransactionAdded?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense",
    date: new Date().toISOString().split("T")[0],
    category: "",
    merchant: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          type: formData.type.toUpperCase(),
        }),
      });

      if (response.ok) {
        setFormData({
          description: "",
          amount: "",
          type: "expense",
          date: new Date().toISOString().split("T")[0],
          category: "",
          merchant: "",
        });
        setOpen(false);

        if (onTransactionAdded) {
          onTransactionAdded();
        }
      }
    } catch (error) {
      console.error("Failed to add transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return <div onClick={() => setOpen(true)}>{children}</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Add Transaction</h2>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="What was this transaction for?"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select category</option>
                  <option value="groceries">Groceries</option>
                  <option value="dining">Dining Out</option>
                  <option value="transportation">Transportation</option>
                  <option value="utilities">Utilities</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Merchant (Optional)
              </label>
              <input
                type="text"
                placeholder="Where did you make this transaction?"
                value={formData.merchant}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    merchant: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Transaction"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    transactionCount: 0,
  });

  // Authentication check with proper timing
  useEffect(() => {
    console.log("🔍 Dashboard auth check:", {
      status,
      hasSession: !!session,
      userEmail: session?.user?.email,
    });

    // Don't do anything while loading
    if (status === "loading") {
      console.log("⏳ Session still loading...");
      return;
    }

    // If definitely unauthenticated, redirect after a brief delay
    if (status === "unauthenticated") {
      console.log("❌ Not authenticated, redirecting...");
      setIsRedirecting(true);

      const timer = setTimeout(() => {
        router.push("/auth/signin");
      }, 1000);

      return () => clearTimeout(timer);
    }

    // If authenticated, fetch data
    if (status === "authenticated" && session?.user) {
      console.log("✅ Authenticated as:", session.user.email);
      fetchTransactions();
    }
  }, [status, session, router]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/transactions");
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (transactions: Transaction[]) => {
    const income = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    setStats({
      totalIncome: income,
      totalExpenses: expenses,
      netIncome: income - expenses,
      transactionCount: transactions.length,
    });
  };

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Show redirecting state
  if (isRedirecting || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-lg text-gray-600">Redirecting to sign in...</p>
          <div className="mt-4 space-y-2">
            <Button
              onClick={() => router.push("/auth/signin")}
              variant="outline"
            >
              Click here if not redirected
            </Button>
            <Button
              onClick={() => (window.location.href = "/test-session")}
              variant="ghost"
              size="sm"
            >
              Debug Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show error if authenticated but no user data
  if (status === "authenticated" && !session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Session Issue</h2>
            <p className="text-gray-600 mb-4">
              You're authenticated but user data is missing.
            </p>
            <div className="space-y-2">
              <Button onClick={() => signOut({ callbackUrl: "/" })}>
                Sign Out & Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/test-session")}
              >
                Debug Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main dashboard - only show if authenticated with user data
  if (status !== "authenticated" || !session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">FinanceAI</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">
                {session.user.name || session.user.email}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/analytics")}
              className="flex items-center space-x-1"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTransactions}
              disabled={loading}
              className="flex items-center space-x-1"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center space-x-1"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user.name?.split(" ")[0] || "User"}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Your AI-powered finance dashboard is ready to help you take control
            of your money.
          </p>
        </div>

        {/* Success message for debugging */}
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span>
                ✅ Authentication working! Signed in as: {session.user.email}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Balance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Total Balance</span>
                <DollarSign className="h-5 w-5 text-green-600" />
              </CardTitle>
              <CardDescription>Your current financial position</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p
                  className={`text-3xl font-bold ${
                    stats.netIncome >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(stats.netIncome)}
                </p>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    Income: {formatCurrency(stats.totalIncome)}
                  </span>
                  <span className="flex items-center">
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    Expenses: {formatCurrency(stats.totalExpenses)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                {loading
                  ? "Loading..."
                  : `${stats.transactionCount} total transactions`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-2 animate-spin" />
                  <p className="text-gray-500">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No transactions yet</p>
                  <AddTransactionModal onTransactionAdded={fetchTransactions}>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Transaction
                    </Button>
                  </AddTransactionModal>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 3).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(new Date(transaction.date))}
                          {transaction.merchant && ` • ${transaction.merchant}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            transaction.type === "INCOME"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "INCOME" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </p>
                        {transaction.category && (
                          <p className="text-xs text-gray-500 capitalize">
                            {transaction.category.name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between items-center pt-2">
                    {transactions.length > 3 && (
                      <Button variant="outline" size="sm">
                        View All Transactions
                      </Button>
                    )}
                    <AddTransactionModal onTransactionAdded={fetchTransactions}>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Transaction
                      </Button>
                    </AddTransactionModal>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights Card */}
          <Card>
            <CardHeader>
              <CardTitle>🤖 AI Insights</CardTitle>
              <CardDescription>
                Personalized financial recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-500">
                  Add more transactions to see AI insights
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🚀 Getting Started</CardTitle>
            <CardDescription>
              Let's set up your financial dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="text-2xl mb-2">1️⃣</div>
                <h3 className="font-semibold mb-2">
                  Add Your First Transaction
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Start by adding a transaction to track your finances
                </p>
                <AddTransactionModal onTransactionAdded={fetchTransactions}>
                  <Button size="sm">Add Transaction</Button>
                </AddTransactionModal>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl mb-2">2️⃣</div>
                <h3 className="font-semibold mb-2">View Analytics</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Explore detailed insights and trends
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push("/analytics")}
                >
                  View Analytics
                </Button>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl mb-2">3️⃣</div>
                <h3 className="font-semibold mb-2">Set Budgets</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Create budgets to track your spending goals
                </p>
                <Button size="sm" variant="outline">
                  Coming Soon
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
