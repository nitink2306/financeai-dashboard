"use client";

import { signIn, getProviders } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain, AlertCircle } from "lucide-react";
import Link from "next/link";

function SignInContent() {
  const [providers, setProviders] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Fix the callback URL to use current origin
  const callbackUrl =
    searchParams.get("callbackUrl") ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/dashboard`
      : "/dashboard");

  // Ensure callback URL is not localhost in production
  const getValidCallbackUrl = (url: string) => {
    const isProduction =
      process.env.NEXT_PUBLIC_VERCEL_URL || process.env.NEXT_PUBLIC_SITE_URL;
    if (isProduction && url.includes("localhost")) {
      // Replace localhost URL with production URL
      const productionUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
      return `${productionUrl}/dashboard`;
    }
    return url;
  };

  const errorParam = searchParams.get("error");

  useEffect(() => {
    const setupProviders = async () => {
      try {
        const res = await getProviders();
        setProviders(res);
      } catch (err) {
        setError("Failed to load sign-in providers");
      }
    };
    setupProviders();
  }, []);

  useEffect(() => {
    if (errorParam) {
      switch (errorParam) {
        case "Callback":
          setError(
            "There was a problem with the authentication callback. Please try again."
          );
          break;
        case "Configuration":
          setError("There is a problem with the server configuration.");
          break;
        case "AccessDenied":
          setError("Access denied. Please try again.");
          break;
        case "Verification":
          setError(
            "The verification token has expired or has already been used."
          );
          break;
        default:
          setError("An error occurred during sign in. Please try again.");
      }
    }
  }, [errorParam]);

  const handleSignIn = async (providerId: string) => {
    setLoading(true);
    setError(null);

    try {
      const validCallbackUrl = getValidCallbackUrl(callbackUrl);
      console.log("Signing in with callback URL:", validCallbackUrl);

      const result = await signIn(providerId, {
        callbackUrl: validCallbackUrl,
        redirect: false, // Handle redirect manually
      });

      if (result?.error) {
        setError(`Sign in failed: ${result.error}`);
        setLoading(false);
      } else if (result?.url) {
        // Redirect to the returned URL
        window.location.href = result.url;
      } else {
        // Fallback redirect
        router.push(validCallbackUrl);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">FinanceAI</span>
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your account to continue managing your finances with AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {providers &&
            Object.values(providers).map((provider: any) => (
              <Button
                key={provider.name}
                onClick={() => handleSignIn(provider.id)}
                className="w-full"
                size="lg"
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {loading ? "Signing in..." : "Continue with Google"}
              </Button>
            ))}

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">
                  FinanceAI
                </span>
              </div>
              <CardTitle className="text-2xl">Loading...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
