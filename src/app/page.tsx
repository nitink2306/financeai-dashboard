"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  // CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Brain,
  Camera,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleGetStarted = () => {
    if (session) {
      router.push("/dashboard");
    } else {
      signIn();
    }
  };

  const handleSignIn = () => {
    if (session) {
      router.push("/dashboard");
    } else {
      router.push("/auth/signin");
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">FinanceAI</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="#features"
              className="text-gray-600 hover:text-gray-900"
            >
              Features
            </Link>
            <Link href="#demo" className="text-gray-600 hover:text-gray-900">
              Demo
            </Link>
            <Button variant="outline" size="sm" onClick={handleSignIn}>
              {session ? "Dashboard" : "Sign In"}
            </Button>
            <Button size="sm" onClick={handleGetStarted}>
              {session ? "Dashboard" : "Get Started"}
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Personal
            <span className="text-blue-600 block">Finance Dashboard</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your financial life with intelligent expense tracking,
            AI-powered insights, and predictive budgeting that learns from your
            spending patterns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 py-3"
              onClick={handleGetStarted}
            >
              {session ? "Go to Dashboard" : "Start Free Trial"}
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Intelligent Finance Management
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Leverage cutting-edge AI to understand your finances like never
            before
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Camera className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>OCR Receipt Scanning</CardTitle>
              <CardDescription>
                Snap a photo of any receipt and our AI instantly extracts
                transaction details
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Brain className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Smart Categorization</CardTitle>
              <CardDescription>
                AI automatically categorizes expenses with 95% accuracy,
                learning your patterns
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Predictive Budgeting</CardTitle>
              <CardDescription>
                Forecast future spending and get personalized recommendations to
                meet your goals
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Beautiful visualizations and insights that reveal your spending
                patterns
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Zap className="h-12 w-12 text-yellow-600 mb-4" />
              <CardTitle>Real-time Insights</CardTitle>
              <CardDescription>
                Get instant notifications about unusual spending and saving
                opportunities
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-red-600 mb-4" />
              <CardTitle>Bank-level Security</CardTitle>
              <CardDescription>
                Your data is encrypted and secure with industry-leading security
                protocols
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Finances?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already taken control of their
            financial future with FinanceAI
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-3"
            onClick={handleGetStarted}
          >
            {session ? "Go to Dashboard" : "Get Started Today"}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-6 w-6" />
            <span className="text-xl font-bold">FinanceAI</span>
          </div>
          <p className="text-gray-400">
            © 2024 FinanceAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
