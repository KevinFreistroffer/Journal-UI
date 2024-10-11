import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  providers: [
    TwitterProvider({
      clientId: process.env.X_CLIENT_ID as string,
      clientSecret: process.env.X_CLIENT_SECRET as string,
      version: "2.0", // opt-in to Twitter OAuth 2.0
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      
      return session;
    },
  },
});
