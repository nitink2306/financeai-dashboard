"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain, User, LogOut } from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Only redirect if we're sure there's no session (not loading)
  useEffect(() => {
    if (status === "loading") return; // Still loading, don't redirect

    if (status === "unauthenticated") {
      console.log("User not authenticated, redirecting to signin");
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting (if unauthenticated)
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, show dashboard
  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">FinanceAI</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">{session.user.name}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center space-x-1"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Your AI-powered finance dashboard is ready to help you take control
            of your money.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>
                Your financial overview at a glance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-2xl font-bold text-green-600">$0.00</p>
                <p className="text-sm text-gray-500">Total Balance</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">No transactions yet</p>
                <Button className="mt-4" size="sm">
                  Add Transaction
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
              <CardDescription>
                Personalized financial recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-500">
                  Start adding transactions to see AI insights
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🚀 Getting Started</CardTitle>
            <CardDescription>
              Lets set up your financial dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="text-2xl mb-2">1️⃣</div>
                <h3 className="font-semibold mb-2">
                  Add Your First Transaction
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Start by adding a transaction or uploading a receipt
                </p>
                <Button size="sm">Add Transaction</Button>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl mb-2">2️⃣</div>
                <h3 className="font-semibold mb-2">Set Up Categories</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Organize your expenses with custom categories
                </p>
                <Button size="sm" variant="outline">
                  Set Categories
                </Button>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl mb-2">3️⃣</div>
                <h3 className="font-semibold mb-2">Create Budgets</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Set spending limits and track your goals
                </p>
                <Button size="sm" variant="outline">
                  Create Budget
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
