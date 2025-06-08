"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Download,
  Calendar,
  DollarSign,
  Target,
  Activity,
  Brain,
  RefreshCw,
  BarChart3,
} from "lucide-react";

interface AnalyticsData {
  timeSeries: Array<{
    date: string;
    income: number;
    expenses: number;
    net: number;
    transactions: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
    transactions: number;
    avgAmount: number;
  }>;
  trends: Array<{
    period: string;
    growth: number;
    trend: "up" | "down" | "stable";
    significance: "high" | "medium" | "low";
  }>;
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    avgDailySpending: number;
    topCategory: string;
    transactionCount: number;
    period: string;
  };
  insights: string[];
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "quarter" | "year">(
    "month"
  );

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      } else {
        console.error("Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const downloadCsv = () => {
    if (!analytics) return;

    const csvContent = [
      ["Date", "Income", "Expenses", "Net"],
      ...analytics.timeSeries.map((row) => [
        row.date,
        row.income.toFixed(2),
        row.expenses.toFixed(2),
        row.net.toFixed(2),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const goBack = () => {
    window.location.href = "/dashboard";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Failed to load analytics</p>
          <Button onClick={fetchAnalytics} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={goBack}
                className="flex items-center space-x-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600">Financial insights and trends</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadCsv}
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAnalytics}
                className="flex items-center space-x-1"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Period Selector */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-600" />
            <div className="flex space-x-2">
              {(["week", "month", "quarter", "year"] as const).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriod(p)}
                  className="capitalize"
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Income
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(analytics.summary.totalIncome)}
              </div>
              <p className="text-xs text-gray-600">
                {analytics.summary.transactionCount} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(analytics.summary.totalExpenses)}
              </div>
              <p className="text-xs text-gray-600">
                Avg: {formatCurrency(analytics.summary.avgDailySpending)}/day
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income</CardTitle>
              <DollarSign
                className={`h-4 w-4 ${
                  analytics.summary.netIncome >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  analytics.summary.netIncome >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatCurrency(analytics.summary.netIncome)}
              </div>
              <p className="text-xs text-gray-600">This {period}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Top Category
              </CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {analytics.summary.topCategory}
              </div>
              <p className="text-xs text-gray-600">Highest spending</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            {/* Income vs Expenses Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Income vs Expenses Over Time</CardTitle>
                <CardDescription>Track your financial flow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={formatDate} />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip
                        formatter={(value, name) => [
                          formatCurrency(Number(value)),
                          name,
                        ]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="income"
                        stackId="1"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.6}
                        name="Income"
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stackId="2"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.6}
                        name="Expenses"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Net Income Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Net Income Trend</CardTitle>
                <CardDescription>
                  Your financial balance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={formatDate} />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip
                        formatter={(value) => [
                          formatCurrency(Number(value)),
                          "Net Income",
                        ]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="net"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            {/* Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                  <CardDescription>Breakdown of your expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="amount"
                          label={({ category, percentage }) =>
                            `${category}: ${percentage.toFixed(1)}%`
                          }
                        >
                          {analytics.categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatCurrency(Number(value))}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Category Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Details</CardTitle>
                  <CardDescription>
                    Detailed breakdown with averages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {analytics.categoryBreakdown.map((category, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <div>
                            <p className="font-medium">{category.category}</p>
                            <p className="text-sm text-gray-600">
                              {category.transactions} transactions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {formatCurrency(category.amount)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Avg: {formatCurrency(category.avgAmount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {category.percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span>Financial Insights</span>
                </CardTitle>
                <CardDescription>
                  AI-powered analysis of your spending patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.insights.map((insight, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-l-4 border-purple-500"
                    >
                      <p className="text-gray-800">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trends Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Trend Analysis</CardTitle>
                <CardDescription>
                  Recent changes in your financial patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.trends.map((trend, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {trend.trend === "up" ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : trend.trend === "down" ? (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        ) : (
                          <Activity className="h-5 w-5 text-gray-600" />
                        )}
                        <div>
                          <p className="font-medium">{trend.period}</p>
                          <p className="text-sm text-gray-600">
                            Significance: {trend.significance}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            trend.growth > 0
                              ? "text-green-600"
                              : trend.growth < 0
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          {trend.growth > 0 ? "+" : ""}
                          {trend.growth.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                  {analytics.trends.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      Add more transactions to see trend analysis
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {/* Detailed Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Summary</CardTitle>
                <CardDescription>
                  Detailed transaction statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Transactions:</span>
                    <span className="font-medium">
                      {analytics.summary.transactionCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Period:</span>
                    <span className="font-medium capitalize">
                      {analytics.summary.period}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Average Daily Spending:
                    </span>
                    <span className="font-medium">
                      {formatCurrency(analytics.summary.avgDailySpending)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expense Categories:</span>
                    <span className="font-medium">
                      {analytics.categoryBreakdown.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Raw Time Series Data */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest financial activity breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Date</th>
                        <th className="text-right p-2">Income</th>
                        <th className="text-right p-2">Expenses</th>
                        <th className="text-right p-2">Net</th>
                        <th className="text-right p-2">Transactions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.timeSeries.slice(-10).map((row, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2">{row.date}</td>
                          <td className="p-2 text-right text-green-600">
                            {formatCurrency(row.income)}
                          </td>
                          <td className="p-2 text-right text-red-600">
                            {formatCurrency(row.expenses)}
                          </td>
                          <td
                            className={`p-2 text-right font-medium ${
                              row.net >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {formatCurrency(row.net)}
                          </td>
                          <td className="p-2 text-right text-gray-600">
                            {row.transactions}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {analytics.timeSeries.length > 10 && (
                    <p className="text-center text-gray-500 mt-4">
                      Showing last 10 entries of {analytics.timeSeries.length}{" "}
                      total
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
