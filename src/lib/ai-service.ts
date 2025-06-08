import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CategorySuggestion {
  category: string;
  confidence: number;
  reasoning: string;
  suggestedIcon: string;
  suggestedColor: string;
}

export interface FinancialInsight {
  type:
    | "SPENDING_PATTERN"
    | "BUDGET_ALERT"
    | "SAVING_OPPORTUNITY"
    | "UNUSUAL_ACTIVITY"
    | "PREDICTION";
  title: string;
  content: string;
  priority: number;
  actionable: boolean;
  recommendations?: string[];
  data?: any;
}

export interface TransactionData {
  description: string;
  amount: number;
  merchant?: string;
  date: string;
}

// Smart categorization with AI
export async function categorizeTransaction(
  transaction: TransactionData
): Promise<CategorySuggestion> {
  try {
    const prompt = `
You are a financial expert analyzing transactions. Categorize this transaction with high accuracy:

Transaction: "${transaction.description}"
Amount: ${transaction.amount}
Merchant: ${transaction.merchant || "Unknown"}

IMPORTANT CATEGORIES & EXAMPLES:
- transportation: Uber, Lyft, taxi, gas stations, parking, public transit, car payments, tolls, car repairs
- groceries: Walmart, Target grocery, Kroger, supermarkets, food stores
- dining: McDonald's, restaurants, cafes, DoorDash, food delivery, takeout
- utilities: Electric bill, water, internet, phone, cable
- entertainment: Netflix, Spotify, movies, games, concerts, subscriptions
- healthcare: Pharmacy, doctor, medical, insurance, CVS health items
- shopping: Amazon, clothing stores, electronics, retail (non-grocery)
- travel: Hotels, flights, Airbnb, vacation expenses
- housing: Rent, mortgage, home maintenance, furniture
- income: Salary, paycheck, freelance payment, refunds
- other: Only if truly doesn't fit any category above

ANALYZE CAREFULLY:
- "Uber" or "Lyft" = transportation (NOT other)
- "ride to airport" = transportation 
- Any ride service = transportation
- Gas stations = transportation
- Grocery stores = groceries
- Fast food = dining

Respond ONLY with valid JSON:
{
  "category": "exact_category_name",
  "confidence": 0.85,
  "reasoning": "Clear explanation why this category",
  "suggestedIcon": "🚗",
  "suggestedColor": "#3b82f6"
}

Be precise and confident in categorization.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1, // Even lower temperature for more consistent results
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse JSON response
    const suggestion = JSON.parse(content) as CategorySuggestion;

    // Validate response
    if (
      !suggestion.category ||
      !suggestion.confidence ||
      !suggestion.reasoning
    ) {
      throw new Error("Invalid AI response format");
    }

    // Boost confidence if we have strong keyword matches
    const boostedSuggestion = boostConfidenceWithKeywords(
      transaction,
      suggestion
    );

    return boostedSuggestion;
  } catch (error) {
    console.error("AI categorization failed:", error);

    // Fallback to rule-based categorization
    return fallbackCategorization(transaction);
  }
}

// Boost confidence with keyword matching
function boostConfidenceWithKeywords(
  transaction: TransactionData,
  suggestion: CategorySuggestion
): CategorySuggestion {
  const description = transaction.description.toLowerCase();
  const merchant = transaction.merchant?.toLowerCase() || "";

  // Strong transportation keywords
  const transportKeywords = [
    "uber",
    "lyft",
    "taxi",
    "ride",
    "gas",
    "fuel",
    "parking",
    "metro",
    "bus",
    "train",
    "airport",
  ];
  const hasTransportKeyword = transportKeywords.some(
    (keyword) => description.includes(keyword) || merchant.includes(keyword)
  );

  if (hasTransportKeyword && suggestion.category === "transportation") {
    return {
      ...suggestion,
      confidence: Math.min(0.95, suggestion.confidence + 0.2),
      reasoning: `Strong keyword match detected: ${suggestion.reasoning}`,
    };
  }

  return suggestion;
}

// Fallback categorization when AI fails
function fallbackCategorization(
  transaction: TransactionData
): CategorySuggestion {
  const description = transaction.description.toLowerCase();
  const merchant = transaction.merchant?.toLowerCase() || "";

  // Transportation (highest priority - covers rides, gas, etc.)
  if (
    description.includes("uber") ||
    description.includes("lyft") ||
    description.includes("taxi") ||
    description.includes("ride") ||
    description.includes("gas") ||
    description.includes("fuel") ||
    description.includes("parking") ||
    description.includes("metro") ||
    description.includes("bus") ||
    description.includes("train") ||
    description.includes("airport") ||
    merchant.includes("shell") ||
    merchant.includes("exxon") ||
    merchant.includes("bp")
  ) {
    return {
      category: "transportation",
      confidence: 0.9,
      reasoning: "Matched transportation keywords (Uber, ride, gas, etc.)",
      suggestedIcon: "🚗",
      suggestedColor: "#3b82f6",
    };
  }

  // Groceries
  if (
    description.includes("grocery") ||
    description.includes("supermarket") ||
    merchant.includes("walmart") ||
    merchant.includes("kroger") ||
    merchant.includes("target")
  ) {
    return {
      category: "groceries",
      confidence: 0.85,
      reasoning: "Matched grocery-related keywords",
      suggestedIcon: "🛒",
      suggestedColor: "#22c55e",
    };
  }

  // Dining
  if (
    description.includes("restaurant") ||
    description.includes("cafe") ||
    description.includes("food") ||
    merchant.includes("mcdonalds") ||
    merchant.includes("starbucks") ||
    merchant.includes("chipotle") ||
    description.includes("doordash") ||
    description.includes("ubereats")
  ) {
    return {
      category: "dining",
      confidence: 0.85,
      reasoning: "Matched dining/food keywords",
      suggestedIcon: "🍽️",
      suggestedColor: "#f59e0b",
    };
  }

  // Entertainment/Subscriptions
  if (
    description.includes("netflix") ||
    description.includes("spotify") ||
    description.includes("subscription") ||
    description.includes("movie") ||
    description.includes("game")
  ) {
    return {
      category: "entertainment",
      confidence: 0.85,
      reasoning: "Matched entertainment/subscription keywords",
      suggestedIcon: "🎬",
      suggestedColor: "#8b5cf6",
    };
  }

  // Income
  if (
    description.includes("salary") ||
    description.includes("paycheck") ||
    description.includes("deposit") ||
    description.includes("payment") ||
    transaction.amount > 500
  ) {
    return {
      category: "income",
      confidence: 0.8,
      reasoning: "Matched income-related keywords or large amount",
      suggestedIcon: "💰",
      suggestedColor: "#10b981",
    };
  }

  // Default category
  return {
    category: "other",
    confidence: 0.5,
    reasoning: "No specific category match found",
    suggestedIcon: "💳",
    suggestedColor: "#6b7280",
  };
}

// Generate financial insights
export async function generateFinancialInsights(
  transactions: any[],
  timeframe: "week" | "month" | "year" = "month"
): Promise<FinancialInsight[]> {
  try {
    // Prepare transaction summary for AI
    const totalSpent = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);
    const categories = transactions.reduce((acc, t) => {
      if (t.category?.name) {
        acc[t.category.name] = (acc[t.category.name] || 0) + t.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    const prompt = `
Analyze this financial data and provide actionable insights:

Financial Summary (${timeframe}):
- Total Income: $${totalIncome}
- Total Expenses: $${totalSpent}
- Net Income: $${totalIncome - totalSpent}
- Transaction Count: ${transactions.length}

Spending by Category:
${Object.entries(categories)
  .map(([cat, amount]) => `- ${cat}: $${amount}`)
  .join("\n")}

Recent Transactions:
${transactions
  .slice(0, 10)
  .map((t) => `- ${t.description}: $${t.amount} (${t.type})`)
  .join("\n")}

Generate 2-4 personalized financial insights. For each insight, respond with a JSON object:
{
  "type": "SPENDING_PATTERN" | "BUDGET_ALERT" | "SAVING_OPPORTUNITY" | "UNUSUAL_ACTIVITY" | "PREDICTION",
  "title": "Insight title",
  "content": "Detailed explanation and analysis",
  "priority": 1-5,
  "actionable": true/false,
  "recommendations": ["actionable suggestion 1", "actionable suggestion 2"]
}

Return an array of these JSON objects. Focus on actionable insights that help improve financial health.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      return [];
    }

    // Parse JSON response
    const insights = JSON.parse(content) as FinancialInsight[];
    return Array.isArray(insights) ? insights : [insights];
  } catch (error) {
    console.error("AI insights generation failed:", error);
    return generateFallbackInsights(transactions);
  }
}

// Fallback insights when AI fails
function generateFallbackInsights(transactions: any[]): FinancialInsight[] {
  const insights: FinancialInsight[] = [];

  const totalExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);
  const avgTransaction = totalExpenses / transactions.length || 0;

  if (totalExpenses > 1000) {
    insights.push({
      type: "SPENDING_PATTERN",
      title: "High Monthly Spending Detected",
      content: `You've spent $${totalExpenses.toFixed(
        2
      )} this month. Consider reviewing your expenses to identify areas for savings.`,
      priority: 3,
      actionable: true,
      recommendations: [
        "Review largest expenses",
        "Set a monthly budget",
        "Track daily spending",
      ],
    });
  }

  if (avgTransaction > 100) {
    insights.push({
      type: "SAVING_OPPORTUNITY",
      title: "Large Transaction Pattern",
      content: `Your average transaction is $${avgTransaction.toFixed(
        2
      )}. Consider if these large purchases are necessary.`,
      priority: 2,
      actionable: true,
      recommendations: [
        "Plan large purchases in advance",
        "Compare prices before buying",
        "Consider alternatives",
      ],
    });
  }

  return insights;
}

// Analyze spending patterns
export async function analyzeSpendingPatterns(
  transactions: any[],
  period: "daily" | "weekly" | "monthly" = "monthly"
): Promise<{
  trends: any[];
  predictions: any[];
  anomalies: any[];
}> {
  // This would implement complex pattern analysis
  // For now, return basic analysis
  return {
    trends: [],
    predictions: [],
    anomalies: [],
  };
}
