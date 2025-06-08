import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateAnalytics } from "@/lib/analytics-service";

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
    const period =
      (searchParams.get("period") as "week" | "month" | "quarter" | "year") ||
      "month";

    console.log(
      `📊 Generating analytics for user ${user.id}, period: ${period}`
    );

    // Get transactions for analytics
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      include: {
        category: true,
      },
      orderBy: { date: "desc" },
      take: 1000, // Limit for performance
    });

    console.log(`📊 Found ${transactions.length} transactions for analytics`);

    if (transactions.length === 0) {
      return NextResponse.json({
        analytics: {
          timeSeries: [],
          categoryBreakdown: [],
          trends: [],
          summary: {
            totalIncome: 0,
            totalExpenses: 0,
            netIncome: 0,
            avgDailySpending: 0,
            topCategory: "None",
            transactionCount: 0,
            period,
          },
          insights: ["Add some transactions to see analytics"],
        },
      });
    }

    // Generate comprehensive analytics
    const analytics = generateAnalytics(transactions, period);

    console.log(`📊 Analytics generated:`, {
      timeSeriesPoints: analytics.timeSeries.length,
      categories: analytics.categoryBreakdown.length,
      trends: analytics.trends.length,
      insights: analytics.insights.length,
    });

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("📊 Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to generate analytics" },
      { status: 500 }
    );
  }
}
