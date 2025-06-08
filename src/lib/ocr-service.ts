import Tesseract from "tesseract.js";

export interface ReceiptData {
  merchant: string;
  amount: number;
  date: string;
  items: ReceiptItem[];
  rawText: string;
  confidence: number;
  processingTime: number;
}

export interface ReceiptItem {
  name: string;
  price: number;
  quantity?: number;
}

export interface OCRResult {
  success: boolean;
  data?: ReceiptData;
  error?: string;
  confidence: number;
}

// Main OCR processing function
export async function processReceiptImage(
  imageFile: File | string
): Promise<OCRResult> {
  const startTime = Date.now();

  try {
    console.log("🔍 Starting OCR processing...");

    // Preprocess image if needed
    const processedImage = await preprocessImage(imageFile);

    // Perform OCR with Tesseract
    const ocrResult = await Tesseract.recognize(processedImage, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    console.log("📄 Raw OCR Text:", ocrResult.data.text);
    console.log("🎯 OCR Confidence:", ocrResult.data.confidence);

    // Parse the OCR text into structured data
    const receiptData = parseReceiptText(
      ocrResult.data.text,
      ocrResult.data.confidence
    );
    receiptData.processingTime = Date.now() - startTime;

    return {
      success: true,
      data: receiptData,
      confidence: receiptData.confidence,
    };
  } catch (error) {
    console.error("❌ OCR processing failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown OCR error",
      confidence: 0,
    };
  }
}

// Preprocess image for better OCR results
async function preprocessImage(
  imageFile: File | string
): Promise<File | string> {
  // For now, return the original image
  // In production, you'd implement:
  // - Image rotation correction
  // - Contrast enhancement
  // - Noise reduction
  // - Resize optimization
  return imageFile;
}

// Parse OCR text into structured receipt data
function parseReceiptText(text: string, ocrConfidence: number): ReceiptData {
  console.log("🧠 Parsing receipt text...");

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // Extract merchant name (usually at the top)
  const merchant = extractMerchant(lines);

  // Extract total amount
  const amount = extractAmount(lines);

  // Extract date
  const date = extractDate(lines);

  // Extract individual items
  const items = extractItems(lines);

  // Calculate confidence based on successful extractions
  let confidence = ocrConfidence / 100; // Convert to 0-1 scale

  // Boost confidence if we found key data
  if (merchant !== "Unknown") confidence += 0.1;
  if (amount > 0) confidence += 0.2;
  if (date !== "Unknown") confidence += 0.1;
  if (items.length > 0) confidence += 0.1;

  confidence = Math.min(confidence, 1.0); // Cap at 1.0

  return {
    merchant,
    amount,
    date,
    items,
    rawText: text,
    confidence,
    processingTime: 0, // Will be set later
  };
}

// Extract merchant name from receipt
function extractMerchant(lines: string[]): string {
  // Look for common merchant patterns in first few lines
  const merchantPatterns = [
    // Common store names
    /walmart/i,
    /target/i,
    /kroger/i,
    /safeway/i,
    /costco/i,
    /home depot/i,
    /best buy/i,
    /starbucks/i,
    /mcdonalds/i,
    /subway/i,
    /cvs/i,
    /walgreens/i,
    // Generic patterns
    /store/i,
    /market/i,
    /shop/i,
    /restaurant/i,
    /cafe/i,
  ];

  // Check first 5 lines for merchant name
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];

    // Skip lines that are obviously not merchant names
    if (line.length < 3 || /^\d+$/.test(line) || line.includes("$")) {
      continue;
    }

    // Check against known patterns
    for (const pattern of merchantPatterns) {
      if (pattern.test(line)) {
        return cleanMerchantName(line);
      }
    }

    // If it's the first substantial line and looks like a name, use it
    if (
      i === 0 &&
      line.length > 3 &&
      !line.includes("receipt") &&
      !line.includes("store")
    ) {
      return cleanMerchantName(line);
    }
  }

  return "Unknown";
}

// Clean up merchant name
function cleanMerchantName(name: string): string {
  return name
    .replace(/[#*]+/g, "") // Remove special characters
    .replace(/store.*$/i, "") // Remove "store" suffix
    .replace(/inc\.?$/i, "") // Remove "inc" suffix
    .trim()
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Extract total amount from receipt
function extractAmount(lines: string[]): number {
  const amountPatterns = [
    /total.*?[\$]?(\d+\.?\d*)/i,
    /amount.*?[\$]?(\d+\.?\d*)/i,
    /^[\$]?(\d+\.\d{2})$/,
    /balance.*?[\$]?(\d+\.?\d*)/i,
    /due.*?[\$]?(\d+\.?\d*)/i,
  ];

  let maxAmount = 0;
  const foundAmounts: number[] = [];

  for (const line of lines) {
    // Look for total/amount keywords
    for (const pattern of amountPatterns) {
      const match = line.match(pattern);
      if (match) {
        const amount = parseFloat(match[1]);
        if (!isNaN(amount) && amount > 0) {
          foundAmounts.push(amount);
          maxAmount = Math.max(maxAmount, amount);
        }
      }
    }

    // Also look for standalone dollar amounts
    const dollarMatch = line.match(/\$(\d+\.\d{2})/g);
    if (dollarMatch) {
      for (const match of dollarMatch) {
        const amount = parseFloat(match.replace("$", ""));
        if (!isNaN(amount) && amount > 0) {
          foundAmounts.push(amount);
          maxAmount = Math.max(maxAmount, amount);
        }
      }
    }
  }

  // Return the largest amount found (likely the total)
  return maxAmount;
}

// Extract date from receipt
function extractDate(lines: string[]): string {
  const datePatterns = [
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
    /(\d{1,2}-\d{1,2}-\d{2,4})/,
    /(\d{4}-\d{1,2}-\d{1,2})/,
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2},?\s+\d{2,4}/i,
    /(\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{2,4})/i,
  ];

  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        const dateStr = match[1] || match[0];
        const date = parseDate(dateStr);
        if (date) {
          return date.toISOString().split("T")[0]; // Return YYYY-MM-DD format
        }
      }
    }
  }

  return new Date().toISOString().split("T")[0]; // Default to today
}

// Parse various date formats
function parseDate(dateStr: string): Date | null {
  try {
    // Try direct parsing first
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // Handle MM/DD/YY format
    const mmddyy = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (mmddyy) {
      let year = parseInt(mmddyy[3]);
      if (year < 100) year += 2000; // Convert 2-digit year
      date = new Date(year, parseInt(mmddyy[1]) - 1, parseInt(mmddyy[2]));
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    return null;
  } catch {
    return null;
  }
}

// Extract individual items from receipt
function extractItems(lines: string[]): ReceiptItem[] {
  const items: ReceiptItem[] = [];

  for (const line of lines) {
    // Skip lines that are clearly not items
    if (
      line.length < 3 ||
      /total|tax|subtotal|change|cash|card|visa|mastercard|amex/i.test(line) ||
      /thank you|receipt|store|address|phone/i.test(line)
    ) {
      continue;
    }

    // Look for item patterns: "ITEM NAME $PRICE"
    const itemPattern = /^(.+?)\s+\$?(\d+\.\d{2})$/;
    const match = line.match(itemPattern);

    if (match) {
      const name = match[1].trim();
      const price = parseFloat(match[2]);

      if (name.length > 2 && price > 0 && price < 1000) {
        // Reasonable price range
        items.push({
          name: cleanItemName(name),
          price,
          quantity: extractQuantity(name),
        });
      }
    }
  }

  return items;
}

// Clean up item names
function cleanItemName(name: string): string {
  return name
    .replace(/^\d+\s*x?\s*/i, "") // Remove quantity prefix
    .replace(/[*#]+/g, "") // Remove special characters
    .trim();
}

// Extract quantity from item name
function extractQuantity(name: string): number | undefined {
  const qtyMatch = name.match(/^(\d+)\s*x?\s*/i);
  if (qtyMatch) {
    return parseInt(qtyMatch[1]);
  }
  return undefined;
}

// Validate extracted receipt data
export function validateReceiptData(data: ReceiptData): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!data.merchant || data.merchant === "Unknown") {
    warnings.push("Merchant name could not be identified");
  }

  if (!data.amount || data.amount <= 0) {
    errors.push("No valid amount found");
  }

  if (data.amount > 10000) {
    warnings.push("Amount seems unusually high");
  }

  if (!data.date) {
    warnings.push("Date could not be extracted");
  }

  if (data.confidence < 0.5) {
    warnings.push("Low confidence in OCR results");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
