import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { processReceiptImage, validateReceiptData } from "@/lib/ocr-service";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("📸 OCR Processing request received");

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("receipt") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 10MB)" },
        { status: 400 }
      );
    }

    console.log(`📸 Processing image: ${file.name} (${file.size} bytes)`);

    // Save file temporarily for processing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const filename = `receipt_${timestamp}_${file.name}`;
    const tempPath = path.join("/tmp", filename);

    try {
      await writeFile(tempPath, buffer);
      console.log(`💾 Saved temp file: ${tempPath}`);
    } catch (error) {
      // Fallback: process directly from buffer if temp save fails
      console.log("⚠️ Could not save temp file, processing from buffer");
    }

    // Process the receipt image
    const ocrResult = await processReceiptImage(file);

    if (!ocrResult.success) {
      return NextResponse.json(
        {
          error: "OCR processing failed",
          details: ocrResult.error,
        },
        { status: 500 }
      );
    }

    // Validate the extracted data
    const validation = validateReceiptData(ocrResult.data!);

    console.log("✅ OCR processing completed:", {
      success: ocrResult.success,
      confidence: ocrResult.confidence,
      merchant: ocrResult.data?.merchant,
      amount: ocrResult.data?.amount,
      items: ocrResult.data?.items.length,
    });

    return NextResponse.json({
      success: true,
      data: ocrResult.data,
      validation,
      processingTime: ocrResult.data?.processingTime,
    });
  } catch (error) {
    console.error("❌ OCR API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
