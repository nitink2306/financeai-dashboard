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
    error: "/auth/signin",
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
      const productionUrl = process.env.NEXTAUTH_URL;

      // Always use NEXTAUTH_URL in production, fallback to baseUrl in development
      const finalBaseUrl = productionUrl || baseUrl;

      // Security: Only allow redirects to trusted domains
      const trustedHosts = [
        new URL(finalBaseUrl).host,
        process.env.VERCEL_URL,
        "financeai-dashboard.vercel.app",
      ].filter(Boolean);

      try {
        const urlHost = new URL(
          url.startsWith("http") ? url : `${finalBaseUrl}${url}`
        ).host;
        if (!trustedHosts.includes(urlHost)) {
          return `${finalBaseUrl}/dashboard`;
        }
      } catch {
        return `${finalBaseUrl}/dashboard`;
      }

      // Handle callback URLs
      if (url.includes("/api/auth/callback")) {
        return `${finalBaseUrl}/dashboard`;
      }

      // If the url is relative, make it absolute
      if (url.startsWith("/")) {
        return `${finalBaseUrl}${url}`;
      }

      // If url is already absolute and trusted, use it
      return url.startsWith(finalBaseUrl) ? url : `${finalBaseUrl}/dashboard`;
    },
  },
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
