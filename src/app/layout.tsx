import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import { getServerSession } from "next-auth";
import Providers from "@/components/providers/session-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinanceAI - AI-Powered Personal Finance Dashboard",
  description:
    "Transform your financial life with intelligent expense tracking, AI-powered insights, and predictive budgeting.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
