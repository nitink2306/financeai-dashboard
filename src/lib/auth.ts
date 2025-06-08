import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const authOptions: AuthOptions = {
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
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback:", { url, baseUrl });

      // If the URL is already a full URL starting with baseUrl, use it
      if (url.startsWith(baseUrl)) return url;

      // If the URL is a relative path, prepend baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      // For OAuth callbacks, redirect to dashboard
      if (url.includes("callback")) return `${baseUrl}/dashboard`;

      // Default redirect to dashboard
      return `${baseUrl}/dashboard`;
    },
  },
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
