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
      console.log("Redirect callback:", { url, baseUrl });

      // Force production base URL when on Vercel
      const isProduction = process.env.VERCEL_URL || process.env.NEXTAUTH_URL;
      const productionBaseUrl =
        process.env.NEXTAUTH_URL ||
        `https://${process.env.VERCEL_URL}` ||
        baseUrl;

      // Always use production URL when deployed
      const finalBaseUrl = isProduction ? productionBaseUrl : baseUrl;

      // If URL contains localhost but we're in production, redirect to production dashboard
      if (url.includes("localhost") && isProduction) {
        return `${finalBaseUrl}/dashboard`;
      }

      // If the URL is already a full URL starting with our base, use it
      if (url.startsWith(finalBaseUrl)) {
        return url;
      }

      // If the URL is a relative path, prepend finalBaseUrl
      if (url.startsWith("/")) {
        return `${finalBaseUrl}${url}`;
      }

      // For OAuth callbacks, redirect to dashboard
      if (url.includes("callback")) {
        return `${finalBaseUrl}/dashboard`;
      }

      // Default redirect to dashboard
      return `${finalBaseUrl}/dashboard`;
    },
  },
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
