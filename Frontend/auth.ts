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
      const exchangeGoogleTokenForBackendAuth = async (idToken: string) => {
        try {
          const response = await fetch(`${backendUrl}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
            cache: "no-store",
          });

          if (!response.ok) {
            token.backendAccessToken = undefined;
            token.backendUserStatus = undefined;
            token.backendUserId = undefined;
            token.backendAuthError = "BACKEND_AUTH_FAILED";
            return;
          }

          const data = (await response.json()) as {
            accessToken: string;
            userStatus: "ACTIVE" | "INCOMPLETE";
            userId: number | null;
          };

          token.backendAccessToken = data.accessToken;
          token.backendUserStatus = data.userStatus;
          token.backendUserId = data.userId ?? undefined;
          token.backendAuthError = undefined;
        } catch {
          token.backendAccessToken = undefined;
          token.backendUserStatus = undefined;
          token.backendUserId = undefined;
          token.backendAuthError = "BACKEND_AUTH_FAILED";
        }
      };

      if (account?.id_token) {
        token.googleIdToken = account.id_token;
        token.backendAccessToken = undefined;
        token.backendUserStatus = undefined;
        token.backendUserId = undefined;
        token.backendAuthError = undefined;
        await exchangeGoogleTokenForBackendAuth(account.id_token);
      }

      if (trigger === "update") {
        if (session.user?.name) {
          token.name = session.user.name;
        }

        if (session.refreshBackendAuth && token.googleIdToken) {
          await exchangeGoogleTokenForBackendAuth(token.googleIdToken);
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

        if (session.backendAuthError !== undefined) {
          token.backendAuthError = session.backendAuthError;
        }

        token.refreshBackendAuth = undefined;
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
      session.backendAuthError = token.backendAuthError;
      return session;
    },
  },
});
