import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const transactionSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().optional(),
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
    const validatedData = transactionSchema.parse({
      ...body,
      type: body.type.toUpperCase(), // Convert to enum format
    });

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find or create category
    let categoryId = null;
    if (validatedData.category) {
      let category = await prisma.category.findFirst({
        where: {
          name: validatedData.category,
          OR: [
            { userId: user.id },
            { userId: null }, // Default categories
          ],
        },
      });

      if (!category) {
        // Create new category
        category = await prisma.category.create({
          data: {
            name: validatedData.category,
            color: "#8884d8", // Default color
            icon: "💰", // Default icon
            type: validatedData.type,
            userId: user.id,
          },
        });
      }

      categoryId = category.id;
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        description: validatedData.description,
        amount: validatedData.amount,
        type: validatedData.type,
        date: new Date(validatedData.date),
        merchant: validatedData.merchant,
        categoryId,
        userId: user.id,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Transaction creation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      include: {
        category: true,
      },
      orderBy: { date: "desc" },
      take: limit,
      skip: offset,
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
