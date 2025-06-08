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
} from "lucide-react";

// Define the Transaction interface
interface Transaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  date: string;
  type: "INCOME" | "EXPENSE";
  categoryId?: string;
  merchant?: string;
  category?: {
    id: string;
    name: string;
    color: string;
    icon: string;
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

// Simple Transaction Modal Component with AI
function AddTransactionModal({
  children,
  onTransactionAdded,
}: {
  children: React.ReactNode;
  onTransactionAdded?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense",
    date: new Date().toISOString().split("T")[0],
    category: "",
  });

  // AI categorization when description and amount are filled
  useEffect(() => {
    if (
      formData.description &&
      formData.amount &&
      parseFloat(formData.amount) > 0
    ) {
      const timeoutId = setTimeout(() => {
        getAiSuggestion();
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [formData.description, formData.amount]);

  const getAiSuggestion = async () => {
    try {
      const response = await fetch("/api/ai/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: formData.description,
          amount: parseFloat(formData.amount),
          date: formData.date,
        }),
      });

      if (response.ok) {
        const suggestion = await response.json();
        setAiSuggestion(suggestion);
        setShowAiSuggestion(true);
      }
    } catch (error) {
      console.error("AI suggestion failed:", error);
    }
  };

  const acceptAiSuggestion = () => {
    if (aiSuggestion) {
      setFormData((prev) => ({ ...prev, category: aiSuggestion.category }));
      setShowAiSuggestion(false);
    }
  };

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
        });
        setOpen(false);
        setAiSuggestion(null);
        setShowAiSuggestion(false);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Add Transaction</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
              }
              className="w-full p-2 border rounded-md"
              required
            />
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

          {showAiSuggestion && aiSuggestion && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    🤖 AI Suggestion: {aiSuggestion.category}
                  </p>
                  <p className="text-xs text-blue-600">
                    {aiSuggestion.reasoning} (Confidence:{" "}
                    {Math.round(aiSuggestion.confidence * 100)}%)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={acceptAiSuggestion}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  Accept
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select category</option>
              <option value="groceries">Groceries</option>
              <option value="dining">Dining Out</option>
              <option value="transportation">Transportation</option>
              <option value="utilities">Utilities</option>
              <option value="entertainment">Entertainment</option>
              <option value="healthcare">Healthcare</option>
              <option value="shopping">Shopping</option>
              <option value="travel">Travel</option>
              <option value="education">Education</option>
              <option value="housing">Housing</option>
              <option value="income">Income</option>
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
  );
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    transactionCount: 0,
  });

  // Only redirect if we're sure there's no session (not loading)
  useEffect(() => {
    if (status === "loading") return; // Still loading, don't redirect

    if (status === "unauthenticated") {
      console.log("User not authenticated, redirecting to signin");
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch transactions when user is authenticated
  useEffect(() => {
    if (status === "authenticated") {
      fetchTransactions();
    }
  }, [status]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/transactions");
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
        calculateStats(data);

        // Fetch AI insights if we have transactions
        if (data.length > 0) {
          fetchAiInsights();
        }
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiInsights = async () => {
    setInsightsLoading(true);
    try {
      const response = await fetch("/api/ai/insights?timeframe=month");
      if (response.ok) {
        const data = await response.json();
        setAiInsights(data.insights || []);
      }
    } catch (error) {
      console.error("Failed to fetch AI insights:", error);
    } finally {
      setInsightsLoading(false);
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
          <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting (if unauthenticated)
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, show dashboard
  if (!session?.user) return null;

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
              <span className="text-sm text-gray-600">{session.user.name}</span>
            </div>
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
            Welcome back, {session.user.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Your AI-powered finance dashboard is ready to help you take control
            of your money.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <p className="text-gray-500">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No transactions yet</p>
                  <AddTransactionModal onTransactionAdded={fetchTransactions}>
                    <Button className="mt-4" size="sm">
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
                  {transactions.length > 3 && (
                    <div className="text-center pt-2">
                      <Button variant="outline" size="sm">
                        View All Transactions
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🤖 AI Insights</CardTitle>
              <CardDescription>
                Personalized financial recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {insightsLoading ? (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
                  <p className="text-gray-500">
                    AI is analyzing your finances...
                  </p>
                </div>
              ) : aiInsights.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Add more transactions to see AI insights
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {aiInsights.slice(0, 2).map((insight, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border"
                    >
                      <h4 className="font-medium text-sm text-gray-900 mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        {insight.content}
                      </p>
                      {insight.recommendations &&
                        insight.recommendations.length > 0 && (
                          <div className="space-y-1">
                            {insight.recommendations
                              .slice(0, 2)
                              .map((rec: string, i: number) => (
                                <p
                                  key={i}
                                  className="text-xs text-blue-700 flex items-center"
                                >
                                  <span className="w-1 h-1 bg-blue-400 rounded-full mr-2"></span>
                                  {rec}
                                </p>
                              ))}
                          </div>
                        )}
                    </div>
                  ))}
                  {aiInsights.length > 2 && (
                    <div className="text-center pt-2">
                      <Button variant="outline" size="sm">
                        View All Insights
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
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
                  Start by adding a transaction or uploading a receipt
                </p>
                <AddTransactionModal onTransactionAdded={fetchTransactions}>
                  <Button size="sm">Add Transaction</Button>
                </AddTransactionModal>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl mb-2">2️⃣</div>
                <h3 className="font-semibold mb-2">Set Up Categories</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Organize your expenses with custom categories
                </p>
                <Button size="sm" variant="outline">
                  Set Categories
                </Button>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl mb-2">3️⃣</div>
                <h3 className="font-semibold mb-2">Create Budgets</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Set spending limits and track your goals
                </p>
                <Button size="sm" variant="outline">
                  Create Budget
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
