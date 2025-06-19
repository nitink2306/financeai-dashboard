import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Define the schema for validation
const categorizeSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  merchant: z.string().optional(),
  date: z.string(),
});

// Define the response type
interface CategorySuggestion {
  category: string;
  confidence: number;
  reasoning: string;
  suggestedIcon?: string;
  suggestedColor?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = categorizeSchema.parse(body);

    // Simple rule-based categorization instead of AI for now
    const suggestion = categorizeTransactionLocal(validatedData);

    return NextResponse.json(suggestion);
  } catch (error) {
    console.error("AI categorization error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "AI categorization failed" },
      { status: 500 }
    );
  }
}

// Local categorization function (fallback)
function categorizeTransactionLocal(transaction: {
  description: string;
  amount: number;
  merchant?: string;
  date: string;
}): CategorySuggestion {
  const description = transaction.description.toLowerCase();
  const merchant = transaction.merchant?.toLowerCase() || "";

  // Transportation
  if (
    description.includes("uber") ||
    description.includes("lyft") ||
    description.includes("taxi") ||
    description.includes("gas") ||
    description.includes("fuel") ||
    merchant.includes("shell") ||
    merchant.includes("exxon")
  ) {
    return {
      category: "transportation",
      confidence: 0.9,
      reasoning: "Matched transportation keywords",
      suggestedIcon: "🚗",
      suggestedColor: "#3b82f6",
    };
  }

  // Groceries
  if (
    description.includes("grocery") ||
    description.includes("supermarket") ||
    merchant.includes("walmart") ||
    merchant.includes("kroger")
  ) {
    return {
      category: "groceries",
      confidence: 0.85,
      reasoning: "Matched grocery keywords",
      suggestedIcon: "🛒",
      suggestedColor: "#22c55e",
    };
  }

  // Dining
  if (
    description.includes("restaurant") ||
    description.includes("food") ||
    merchant.includes("mcdonalds") ||
    merchant.includes("starbucks")
  ) {
    return {
      category: "dining",
      confidence: 0.85,
      reasoning: "Matched dining keywords",
      suggestedIcon: "🍽️",
      suggestedColor: "#f59e0b",
    };
  }

  // Entertainment
  if (
    description.includes("netflix") ||
    description.includes("spotify") ||
    description.includes("movie")
  ) {
    return {
      category: "entertainment",
      confidence: 0.85,
      reasoning: "Matched entertainment keywords",
      suggestedIcon: "🎬",
      suggestedColor: "#8b5cf6",
    };
  }

  // Default
  return {
    category: "other",
    confidence: 0.5,
    reasoning: "No specific category match found",
    suggestedIcon: "💳",
    suggestedColor: "#6b7280",
  };
}
