"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
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
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-purple-800/20 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Brain className="h-8 w-8 text-emerald-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
              FinanceAI
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="#features"
              className="text-slate-300 hover:text-emerald-400 transition-colors"
            >
              Features
            </Link>
            {/* <Link
              href="#demo"
              className="text-slate-300 hover:text-emerald-400 transition-colors"
            >
              Demo
            </Link> */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignIn}
              className="border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"
            >
              {session ? "Dashboard" : "Sign In"}
            </Button>
            {!session && (
              <Button
                size="sm"
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-emerald-500 to-purple-600 hover:from-emerald-600 hover:to-purple-700 text-white border-0"
              >
                "Get Started"
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-purple-500/20 border border-emerald-400/20 rounded-full mb-6">
              <span className="text-emerald-400 text-sm font-medium">
                🚀 Next-Gen Financial Intelligence
              </span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-emerald-200 to-purple-200 bg-clip-text text-transparent">
              AI-Powered Personal
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent animate-pulse">
              Finance Revolution
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your financial life with{" "}
            <span className="text-emerald-400 font-semibold">
              intelligent expense tracking
            </span>
            ,
            <span className="text-purple-400 font-semibold">
              {" "}
              AI-powered insights
            </span>
            , and
            <span className="text-emerald-400 font-semibold">
              {" "}
              predictive budgeting
            </span>{" "}
            that learns from your spending patterns.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="text-lg px-8 py-4 bg-gradient-to-r from-emerald-500 to-purple-600 hover:from-emerald-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
            >
              {session ? "Go to Dashboard" : "Start Free Trial"}
              <span className="ml-2">→</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 border-slate-600 text-slate-300 hover:bg-slate-800/50 hover:border-emerald-400/50 hover:text-emerald-400 transition-all duration-300"
            >
              <span className="mr-2">▶</span>
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-2">
                95%
              </div>
              <div className="text-slate-400 text-sm">
                Categorization Accuracy
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">3s</div>
              <div className="text-slate-400 text-sm">Receipt Processing</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-2">
                24/7
              </div>
              <div className="text-slate-400 text-sm">AI Insights</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
              Intelligent Finance Management
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Leverage cutting-edge AI to understand your finances like never
            before
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 group">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">OCR Receipt Scanning</CardTitle>
              <CardDescription className="text-slate-400">
                Snap a photo of any receipt and our AI instantly extracts
                transaction details with 95% accuracy
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 group">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Smart Categorization</CardTitle>
              <CardDescription className="text-slate-400">
                AI automatically categorizes expenses with machine learning,
                adapting to your unique spending patterns
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 group">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Predictive Analytics</CardTitle>
              <CardDescription className="text-slate-400">
                Advanced algorithms forecast future spending and provide
                personalized recommendations to optimize your finances
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 group">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Real-time Analytics</CardTitle>
              <CardDescription className="text-slate-400">
                Beautiful, interactive visualizations that reveal deep insights
                into your spending patterns and trends
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 group">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Instant Insights</CardTitle>
              <CardDescription className="text-slate-400">
                Get real-time notifications about spending anomalies, budget
                alerts, and money-saving opportunities
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 group">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Enterprise Security</CardTitle>
              <CardDescription className="text-slate-400">
                Bank-grade encryption and security protocols protect your
                financial data with military-level standards
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/50 to-purple-900/50"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
              Ready to Transform Your Finances?
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join the financial revolution and take control of your money with
            AI-powered intelligence
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="text-lg px-12 py-4 bg-gradient-to-r from-emerald-500 to-purple-600 hover:from-emerald-600 hover:to-purple-700 text-white border-0 shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 transform hover:scale-105"
          >
            {session ? "Go to Dashboard" : "Start Your Journey Today"}
            <span className="ml-2">🚀</span>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-slate-800 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-6 w-6 text-emerald-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
              FinanceAI
            </span>
          </div>
          <p className="text-slate-400">
            © 2024 FinanceAI. Revolutionizing personal finance with artificial
            intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
}
