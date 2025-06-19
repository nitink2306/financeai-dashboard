import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// TEMPORARY: Use JWT instead of database to isolate the issue
export const authOptions: NextAuthOptions = {
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
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      console.log("🔄 Auth redirect:", { url, baseUrl });

      // Always redirect to dashboard after successful auth
      return `${baseUrl}/dashboard`;
    },
  },
  session: {
    strategy: "jwt", // Use JWT instead of database for now
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false, // Disable debug to reduce noise
};
