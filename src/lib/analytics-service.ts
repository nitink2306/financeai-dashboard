// Advanced Analytics Service for Financial Data

export interface TimeSeriesData {
  date: string;
  income: number;
  expenses: number;
  net: number;
  transactions: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  transactions: number;
  avgAmount: number;
}

export interface TrendAnalysis {
  period: string;
  growth: number;
  trend: "up" | "down" | "stable";
  significance: "high" | "medium" | "low";
}

export interface AnalyticsData {
  timeSeries: TimeSeriesData[];
  categoryBreakdown: CategoryBreakdown[];
  trends: TrendAnalysis[];
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

// Generate comprehensive analytics from transaction data
export function generateAnalytics(
  transactions: any[],
  period: "week" | "month" | "quarter" | "year" = "month"
): AnalyticsData {
  console.log(
    `📊 Generating analytics for ${transactions.length} transactions (${period})`
  );

  // Filter transactions by period
  const filteredTransactions = filterTransactionsByPeriod(transactions, period);

  // Generate time series data
  const timeSeries = generateTimeSeries(filteredTransactions, period);

  // Generate category breakdown
  const categoryBreakdown = generateCategoryBreakdown(filteredTransactions);

  // Generate trend analysis
  const trends = generateTrends(timeSeries);

  // Calculate summary statistics
  const summary = calculateSummary(filteredTransactions, period);

  // Generate insights
  const insights = generateInsights(
    filteredTransactions,
    categoryBreakdown,
    trends
  );

  return {
    timeSeries,
    categoryBreakdown,
    trends,
    summary,
    insights,
  };
}

// Filter transactions by time period
function filterTransactionsByPeriod(
  transactions: any[],
  period: string
): any[] {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "quarter":
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return transactions.filter((t) => new Date(t.date) >= startDate);
}

// Generate time series data for charts
function generateTimeSeries(
  transactions: any[],
  period: string
): TimeSeriesData[] {
  const groupedData = new Map<
    string,
    { income: number; expenses: number; transactions: number }
  >();

  // Group transactions by date
  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    let key: string;

    switch (period) {
      case "week":
        key = date.toISOString().split("T")[0]; // Daily for week view
        break;
      case "month":
        key = date.toISOString().split("T")[0]; // Daily for month view
        break;
      case "quarter":
      case "year":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`; // Monthly
        break;
      default:
        key = date.toISOString().split("T")[0];
    }

    if (!groupedData.has(key)) {
      groupedData.set(key, { income: 0, expenses: 0, transactions: 0 });
    }

    const data = groupedData.get(key)!;
    if (transaction.type === "INCOME") {
      data.income += transaction.amount;
    } else {
      data.expenses += transaction.amount;
    }
    data.transactions++;
  });

  // Convert to array and sort by date
  const timeSeries: TimeSeriesData[] = Array.from(groupedData.entries())
    .map(([date, data]) => ({
      date,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses,
      transactions: data.transactions,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return timeSeries;
}

// Generate category breakdown with percentages
function generateCategoryBreakdown(transactions: any[]): CategoryBreakdown[] {
  const categoryData = new Map<
    string,
    { amount: number; transactions: number; color: string }
  >();

  // Predefined colors for categories
  const categoryColors: Record<string, string> = {
    groceries: "#22c55e",
    dining: "#f59e0b",
    transportation: "#3b82f6",
    utilities: "#8b5cf6",
    entertainment: "#ef4444",
    healthcare: "#06b6d4",
    shopping: "#f97316",
    travel: "#84cc16",
    education: "#6366f1",
    housing: "#ec4899",
    income: "#10b981",
    other: "#6b7280",
  };

  // Group by category (only expenses for breakdown)
  transactions
    .filter((t) => t.type === "EXPENSE")
    .forEach((transaction) => {
      const category = transaction.category?.name || "other";

      if (!categoryData.has(category)) {
        categoryData.set(category, {
          amount: 0,
          transactions: 0,
          color: categoryColors[category] || "#6b7280",
        });
      }

      const data = categoryData.get(category)!;
      data.amount += transaction.amount;
      data.transactions++;
    });

  // Calculate total for percentages
  const totalExpenses = Array.from(categoryData.values()).reduce(
    (sum, data) => sum + data.amount,
    0
  );

  // Convert to array with percentages
  const breakdown: CategoryBreakdown[] = Array.from(categoryData.entries())
    .map(([category, data]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      amount: data.amount,
      percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
      color: data.color,
      transactions: data.transactions,
      avgAmount: data.transactions > 0 ? data.amount / data.transactions : 0,
    }))
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending

  return breakdown;
}

// Generate trend analysis
function generateTrends(timeSeries: TimeSeriesData[]): TrendAnalysis[] {
  if (timeSeries.length < 2) return [];

  const trends: TrendAnalysis[] = [];

  // Calculate spending trend
  const recentSpending = timeSeries
    .slice(-7)
    .reduce((sum, data) => sum + data.expenses, 0);
  const previousSpending = timeSeries
    .slice(-14, -7)
    .reduce((sum, data) => sum + data.expenses, 0);

  if (previousSpending > 0) {
    const spendingGrowth =
      ((recentSpending - previousSpending) / previousSpending) * 100;
    trends.push({
      period: "Recent vs Previous Week",
      growth: spendingGrowth,
      trend:
        spendingGrowth > 5 ? "up" : spendingGrowth < -5 ? "down" : "stable",
      significance:
        Math.abs(spendingGrowth) > 20
          ? "high"
          : Math.abs(spendingGrowth) > 10
          ? "medium"
          : "low",
    });
  }

  return trends;
}

// Generate insights from transaction data
function generateInsights(
  transactions: any[],
  categoryBreakdown: CategoryBreakdown[],
  trends: TrendAnalysis[]
): string[] {
  const insights: string[] = [];

  // Spending pattern insights
  const topCategory = categoryBreakdown[0];
  if (topCategory) {
    insights.push(
      `Your highest spending category is ${
        topCategory.category
      } at ${topCategory.percentage.toFixed(1)}% of total expenses`
    );
  }

  // Trend-based insights
  const spendingTrend = trends.find(
    (t) => t.period === "Recent vs Previous Week"
  );
  if (spendingTrend) {
    if (spendingTrend.trend === "up") {
      insights.push(
        `Your spending has increased by ${Math.abs(
          spendingTrend.growth
        ).toFixed(1)}% compared to last week`
      );
    } else if (spendingTrend.trend === "down") {
      insights.push(
        `Your spending has decreased by ${Math.abs(
          spendingTrend.growth
        ).toFixed(1)}% compared to last week`
      );
    }
  }

  return insights;
}

// Calculate summary statistics
function calculateSummary(transactions: any[], period: string) {
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const daysInPeriod =
    period === "week"
      ? 7
      : period === "month"
      ? 30
      : period === "quarter"
      ? 90
      : 365;

  return {
    totalIncome,
    totalExpenses,
    netIncome: totalIncome - totalExpenses,
    avgDailySpending: totalExpenses / daysInPeriod,
    topCategory: transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((acc, t) => {
        const category = t.category?.name || "other";
        acc[category] = (acc[category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>),
    transactionCount: transactions.length,
    period,
  };
}
