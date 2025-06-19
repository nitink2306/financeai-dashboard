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
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
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
      // Ensure baseUrl is always the production URL in production
      const productionUrl = process.env.NEXTAUTH_URL;
      const finalBaseUrl = productionUrl || baseUrl;

      // Log the redirect attempt for debugging
      console.log("NextAuth Redirect:", {
        url,
        baseUrl,
        finalBaseUrl,
        productionUrl,
      });

      // Always redirect to dashboard after successful auth
      if (url.includes("/api/auth/callback")) {
        return `${finalBaseUrl}/dashboard`;
      }

      // For relative URLs, make them absolute
      if (url.startsWith("/")) {
        return `${finalBaseUrl}${url}`;
      }

      // For absolute URLs, ensure they're on our domain
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(finalBaseUrl);

        if (urlObj.host === baseUrlObj.host) {
          return url;
        }
      } catch (e) {
        console.error("URL parsing error:", e);
      }

      // Default fallback
      return `${finalBaseUrl}/dashboard`;
    },
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug logs temporarily
};
