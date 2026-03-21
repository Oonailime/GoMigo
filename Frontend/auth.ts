import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const backendUrl =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:3001/api";

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, trigger, session }) {
      if (account?.id_token) {
        token.googleIdToken = account.id_token;
        token.backendAccessToken = undefined;
        token.backendUserStatus = undefined;
        token.backendUserId = undefined;

        try {
          const response = await fetch(`${backendUrl}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: account.id_token }),
            cache: "no-store",
          });

          if (response.ok) {
            const data = (await response.json()) as {
              accessToken: string;
              userStatus: "ACTIVE" | "INCOMPLETE";
              userId: number | null;
            };

            token.backendAccessToken = data.accessToken;
            token.backendUserStatus = data.userStatus;
            token.backendUserId = data.userId ?? undefined;
          } else {
            token.backendAccessToken = undefined;
            token.backendUserStatus = "INCOMPLETE";
            token.backendUserId = undefined;
          }
        } catch {
          token.backendAccessToken = undefined;
          token.backendUserStatus = "INCOMPLETE";
          token.backendUserId = undefined;
        }
      }

      if (trigger === "update") {
        if (session.user?.name) {
          token.name = session.user.name;
        }

        if (session.backendAccessToken !== undefined) {
          token.backendAccessToken = session.backendAccessToken;
        }

        if (session.backendUserStatus !== undefined) {
          token.backendUserStatus = session.backendUserStatus;
        }

        if (session.backendUserId !== undefined) {
          token.backendUserId = session.backendUserId;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.name === "string") {
        session.user.name = token.name;
      }

      session.backendAccessToken = token.backendAccessToken;
      session.backendUserStatus = token.backendUserStatus;
      session.backendUserId = token.backendUserId;
      return session;
    },
  },
});
