"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Camera,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Edit3,
  Eye,
  X,
} from "lucide-react";
import Image from "next/image";

interface ReceiptData {
  merchant: string;
  amount: number;
  date: string;
  items: Array<{
    name: string;
    price: number;
    quantity?: number;
  }>;
  confidence: number;
}

interface ReceiptScannerProps {
  onDataExtracted: (data: ReceiptData) => void;
  onCancel: () => void;
}

export default function ReceiptScanner({
  onDataExtracted,
  onCancel,
}: ReceiptScannerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [showRawText, setShowRawText] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Please select an image under 10MB");
      return;
    }

    setSelectedFile(file);
    setError(null);
    setOcrResult(null);

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect]
  );

  // Process the receipt with OCR
  const processReceipt = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("receipt", selectedFile);

      const response = await fetch("/api/ocr/process", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setOcrResult(result);
        console.log("📄 OCR Result:", result);
      } else {
        setError(result.error || "OCR processing failed");
      }
    } catch (err) {
      console.error("OCR error:", err);
      setError("Failed to process receipt. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Use the extracted data
  const useExtractedData = () => {
    if (ocrResult?.data) {
      onDataExtracted(ocrResult.data);
    }
  };

  // Reset the scanner
  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setOcrResult(null);
    setError(null);
    setShowRawText(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      {!selectedFile && (
        <Card>
          <CardContent className="pt-6">
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] && handleFileSelect(e.target.files[0])
                }
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) =>
                  e.target.files?.[0] && handleFileSelect(e.target.files[0])
                }
                className="hidden"
              />

              <div className="flex flex-col items-center space-y-4">
                <Upload className="h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium">Upload Receipt Image</p>
                  <p className="text-sm text-gray-500">
                    Drag and drop or click to select
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Choose File</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center space-x-2"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Take Photo</span>
                  </Button>
                </div>

                <p className="text-xs text-gray-400">
                  Supports JPG, PNG, WebP • Max 10MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Preview */}
      {selectedFile && previewUrl && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Receipt Preview</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={reset}
                    className="flex items-center space-x-1"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset</span>
                  </Button>
                </div>
              </div>

              <div className="relative">
                <Image
                  src={previewUrl}
                  alt="Receipt preview"
                  width={800}
                  height={600}
                  className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
                  style={{ objectFit: "contain" }}
                />
              </div>

              <div className="flex space-x-3">
                {!ocrResult && (
                  <Button
                    onClick={processReceipt}
                    disabled={processing}
                    className="flex-1"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Extract Data
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* File Info */}
              <div className="text-xs text-gray-500 flex justify-between">
                <span>{selectedFile.name}</span>
                <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* OCR Results */}
      {ocrResult && ocrResult.success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium text-green-800">
                    Data Extracted Successfully
                  </h3>
                </div>
                <div className="text-sm text-green-600">
                  {Math.round(ocrResult.data.confidence * 100)}% confidence
                </div>
              </div>

              {/* Extracted Data */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Merchant
                  </p>
                  <p className="font-medium">{ocrResult.data.merchant}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Amount
                  </p>
                  <p className="font-medium text-lg">
                    ${ocrResult.data.amount.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Date
                  </p>
                  <p className="font-medium">{ocrResult.data.date}</p>
                </div>
              </div>

              {/* Items */}
              {ocrResult.data.items && ocrResult.data.items.length > 0 && (
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                    Items Found
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {ocrResult.data.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span>${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation Warnings */}
              {ocrResult.validation?.warnings &&
                ocrResult.validation.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                    <p className="text-xs text-yellow-700 font-medium mb-1">
                      Warnings:
                    </p>
                    {ocrResult.validation.warnings.map(
                      (warning: string, index: number) => (
                        <p key={index} className="text-xs text-yellow-600">
                          • {warning}
                        </p>
                      )
                    )}
                  </div>
                )}

              {/* Actions */}
              <div className="flex space-x-3">
                <Button onClick={useExtractedData} className="flex-1">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Use This Data
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRawText(!showRawText)}
                  className="flex items-center space-x-1"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Raw Text</span>
                </Button>
              </div>

              {/* Raw OCR Text */}
              {showRawText && (
                <div className="bg-gray-50 p-3 rounded border">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                    Raw OCR Text
                  </p>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {ocrResult.data.rawText}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
