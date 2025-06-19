import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Get the production URL from environment variables
      const productionUrl =
        process.env.NEXTAUTH_URL || `https://${process.env.VERCEL_URL}`;

      // Determine if we're in production
      const isProduction =
        !!process.env.VERCEL_URL || !!process.env.NEXTAUTH_URL;

      // Use production URL if available, otherwise fall back to baseUrl
      const finalBaseUrl = isProduction ? productionUrl : baseUrl;

      // Ensure URL is absolute
      const absoluteUrl = url.startsWith("http")
        ? url
        : `${finalBaseUrl}${url.startsWith("/") ? url : `/${url}`}`;

      // For callback URLs, always redirect to dashboard
      if (url.includes("/api/auth/callback")) {
        return `${finalBaseUrl}/dashboard`;
      }

      // If URL is relative to base URL, make it absolute
      if (url.startsWith("/")) {
        return `${finalBaseUrl}${url}`;
      }

      // If URL is already absolute and matches our domain, use it
      if (absoluteUrl.startsWith(finalBaseUrl)) {
        return absoluteUrl;
      }

      // Default fallback to dashboard
      return `${finalBaseUrl}/dashboard`;
    },
  },
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
