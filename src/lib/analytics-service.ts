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
      // Handle both string and object category
      let categoryName = "other";

      if (transaction.category) {
        if (typeof transaction.category === "string") {
          categoryName = transaction.category;
        } else if (transaction.category.name) {
          categoryName = transaction.category.name;
        }
      }

      // Normalize category name
      categoryName = categoryName.toLowerCase().trim();

      if (!categoryData.has(categoryName)) {
        categoryData.set(categoryName, {
          amount: 0,
          transactions: 0,
          color: categoryColors[categoryName] || "#6b7280",
        });
      }

      const data = categoryData.get(categoryName)!;
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

  // Calculate income trend
  const recentIncome = timeSeries
    .slice(-7)
    .reduce((sum, data) => sum + data.income, 0);
  const previousIncome = timeSeries
    .slice(-14, -7)
    .reduce((sum, data) => sum + data.income, 0);

  if (previousIncome > 0) {
    const incomeGrowth =
      ((recentIncome - previousIncome) / previousIncome) * 100;
    trends.push({
      period: "Income Trend",
      growth: incomeGrowth,
      trend: incomeGrowth > 5 ? "up" : incomeGrowth < -5 ? "down" : "stable",
      significance:
        Math.abs(incomeGrowth) > 20
          ? "high"
          : Math.abs(incomeGrowth) > 10
          ? "medium"
          : "low",
    });
  }

  return trends;
}

// Calculate summary statistics
function calculateSummary(
  transactions: any[],
  period: string
): AnalyticsData["summary"] {
  const income = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  // Find top spending category
  const categoryTotals = new Map<string, number>();
  transactions
    .filter((t) => t.type === "EXPENSE" && t.category)
    .forEach((t) => {
      // Handle both string and object category
      let categoryName = "other";

      if (typeof t.category === "string") {
        categoryName = t.category;
      } else if (t.category.name) {
        categoryName = t.category.name;
      }

      categoryName = categoryName.toLowerCase().trim();
      categoryTotals.set(
        categoryName,
        (categoryTotals.get(categoryName) || 0) + t.amount
      );
    });

  const topCategoryEntry = Array.from(categoryTotals.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const topCategory = topCategoryEntry
    ? topCategoryEntry[0].charAt(0).toUpperCase() + topCategoryEntry[0].slice(1)
    : "None";

  // Calculate average daily spending
  const days = getDaysInPeriod(period);
  const avgDailySpending = days > 0 ? expenses / days : 0;

  return {
    totalIncome: income,
    totalExpenses: expenses,
    netIncome: income - expenses,
    avgDailySpending,
    topCategory,
    transactionCount: transactions.length,
    period,
  };
}

// Get number of days in period
function getDaysInPeriod(period: string): number {
  switch (period) {
    case "week":
      return 7;
    case "month":
      return 30;
    case "quarter":
      return 90;
    case "year":
      return 365;
    default:
      return 30;
  }
}

// Generate actionable insights
function generateInsights(
  transactions: any[],
  categoryBreakdown: CategoryBreakdown[],
  trends: TrendAnalysis[]
): string[] {
  const insights: string[] = [];

  // High spending insights
  if (categoryBreakdown.length > 0) {
    const topCategory = categoryBreakdown[0];
    if (topCategory.percentage > 40) {
      insights.push(
        `${topCategory.category} accounts for ${topCategory.percentage.toFixed(
          1
        )}% of your spending. Consider reviewing this category for savings opportunities.`
      );
    }
  }

  // Trend insights
  trends.forEach((trend) => {
    if (trend.significance === "high") {
      if (trend.trend === "up" && trend.period.includes("Recent")) {
        insights.push(
          `Your spending has increased by ${trend.growth.toFixed(
            1
          )}% recently. Monitor your expenses closely.`
        );
      } else if (trend.trend === "down" && trend.period.includes("Recent")) {
        insights.push(
          `Great job! Your spending decreased by ${Math.abs(
            trend.growth
          ).toFixed(1)}% recently.`
        );
      }
    }
  });

  // Transaction frequency insights
  const avgTransactionSize =
    transactions.length > 0
      ? transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) /
        transactions.length
      : 0;

  if (avgTransactionSize > 100) {
    insights.push(
      `Your average transaction is $${avgTransactionSize.toFixed(
        2
      )}. Consider tracking large purchases more carefully.`
    );
  }

  // Default insight if none generated
  if (insights.length === 0) {
    insights.push(
      "Keep tracking your expenses to get personalized insights and recommendations."
    );
  }

  return insights;
}

// Export data functions
export function exportToCsv(data: AnalyticsData): string {
  const csvRows = [
    ["Date", "Income", "Expenses", "Net", "Transactions"],
    ...data.timeSeries.map((row) => [
      row.date,
      row.income.toFixed(2),
      row.expenses.toFixed(2),
      row.net.toFixed(2),
      row.transactions.toString(),
    ]),
  ];

  return csvRows.map((row) => row.join(",")).join("\n");
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// Format percentage for display
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
