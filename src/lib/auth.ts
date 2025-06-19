import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";

// Validate required environment variables
if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("Missing GOOGLE_CLIENT_ID environment variable");
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing GOOGLE_CLIENT_SECRET environment variable");
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET environment variable");
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error", // Add error page
  },
  callbacks: {
    async session({ session, user }) {
      // Ensure user ID is included in session
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Use NEXTAUTH_URL if available, otherwise fall back to baseUrl
      const productionBaseUrl = process.env.NEXTAUTH_URL || baseUrl;

      console.log("Auth redirect:", { url, baseUrl, productionBaseUrl });

      // If the URL is already a full URL starting with our base, use it
      if (url.startsWith(productionBaseUrl)) {
        return url;
      }

      // If the URL is a relative path, prepend baseUrl
      if (url.startsWith("/")) {
        return `${productionBaseUrl}${url}`;
      }

      // For OAuth callbacks, redirect to dashboard
      if (url.includes("callback") || url.includes("signin")) {
        return `${productionBaseUrl}/dashboard`;
      }

      // Default redirect to dashboard
      return `${productionBaseUrl}/dashboard`;
    },
    async signIn({ user, account, profile }) {
      // Allow all Google sign-ins
      if (account?.provider === "google") {
        return true;
      }

      return false;
    },
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  // Add error handling
  logger: {
    error(code, metadata) {
      console.error("NextAuth Error:", code, metadata);
    },
    warn(code) {
      console.warn("NextAuth Warning:", code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.log("NextAuth Debug:", code, metadata);
      }
    },
  },
};
