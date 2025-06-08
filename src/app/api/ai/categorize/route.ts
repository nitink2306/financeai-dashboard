import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { categorizeTransaction } from "@/lib/ai-service";
import { z } from "zod";

const categorizeSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  merchant: z.string().optional(),
  date: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = categorizeSchema.parse(body);

    // Call AI service
    const suggestion = await categorizeTransaction(validatedData);

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
