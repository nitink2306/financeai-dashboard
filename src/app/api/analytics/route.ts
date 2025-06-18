import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateAnalytics } from "@/lib/analytics-service";

// In-memory cache for analytics (5 minutes)
type AnalyticsData = ReturnType<typeof generateAnalytics>;
const CACHE_DURATION = 5 * 60 * 1000;
const analyticsCache = new Map<
  string,
  { data: AnalyticsData; timestamp: number }
>();

// Clean up expired cache entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of analyticsCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      analyticsCache.delete(key);
    }
  }
}, 10 * 60 * 1000);

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

    // Check cache first
    const cacheKey = `${user.id}_${period}`;
    const cached = analyticsCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(
        `📊 Serving cached analytics for user ${user.id}, period: ${period}`
      );

      // Add cache headers
      const response = NextResponse.json({ analytics: cached.data });
      response.headers.set("Cache-Control", "public, max-age=300"); // 5 minutes
      response.headers.set("X-Cache-Status", "HIT");
      return response;
    }

    console.log(
      `📊 Generating fresh analytics for user ${user.id}, period: ${period}`
    );

    // Get optimized date range for the period
    const dateRange = getDateRangeForPeriod(period);

    // Optimized query - only fetch transactions within the period
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
      include: {
        category: true,
      },
      orderBy: { date: "desc" },
    });

    console.log(
      `📊 Found ${transactions.length} transactions for analytics (filtered by date)`
    );

    if (transactions.length === 0) {
      const emptyAnalytics = {
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
      };

      // Cache empty result for shorter time (1 minute)
      analyticsCache.set(cacheKey, {
        data: emptyAnalytics,
        timestamp: Date.now(),
      });

      const response = NextResponse.json({ analytics: emptyAnalytics });
      response.headers.set("Cache-Control", "public, max-age=60");
      response.headers.set("X-Cache-Status", "MISS-EMPTY");
      return response;
    }

    // Generate comprehensive analytics
    const analytics = generateAnalytics(transactions, period);

    // Cache the result
    analyticsCache.set(cacheKey, {
      data: analytics,
      timestamp: Date.now(),
    });

    console.log(`📊 Analytics generated and cached:`, {
      timeSeriesPoints: analytics.timeSeries.length,
      categories: analytics.categoryBreakdown.length,
      trends: analytics.trends.length,
      insights: analytics.insights.length,
    });

    const response = NextResponse.json({ analytics });
    response.headers.set("Cache-Control", "public, max-age=300");
    response.headers.set("X-Cache-Status", "MISS");
    return response;
  } catch (error) {
    console.error("📊 Analytics API error:", error);

    // Detailed error logging in development
    if (process.env.NODE_ENV === "development") {
      console.error("Full error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
      });
    }

    // Return user-friendly error response
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to generate analytics",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

function getDateRangeForPeriod(period: string): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  let start: Date;

  switch (period) {
    case "week":
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "quarter":
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { start, end };
}
