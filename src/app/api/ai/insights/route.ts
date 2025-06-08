import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateFinancialInsights } from "@/lib/ai-service";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe =
      (searchParams.get("timeframe") as "week" | "month" | "year") || "month";

    // Get recent transactions for analysis
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: getDateRange(timeframe),
        },
      },
      include: {
        category: true,
      },
      orderBy: { date: "desc" },
      take: 100, // Limit for performance
    });

    if (transactions.length === 0) {
      return NextResponse.json({ insights: [] });
    }

    // Generate AI insights
    const insights = await generateFinancialInsights(transactions, timeframe);

    // Store insights in database for caching
    for (const insight of insights) {
      await prisma.insight.create({
        data: {
          userId: user.id,
          type: insight.type,
          title: insight.title,
          content: insight.content,
          priority: insight.priority,
          data: insight.recommendations
            ? { recommendations: insight.recommendations }
            : null,
        },
      });
    }

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("AI insights error:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}

function getDateRange(timeframe: string): Date {
  const now = new Date();
  switch (timeframe) {
    case "week":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "year":
      return new Date(now.getFullYear(), 0, 1);
    default:
      return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}
