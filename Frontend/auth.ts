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
      if (trigger) {
        console.log("[auth][jwt] trigger:", trigger);
      }

      if (account?.id_token) {
        console.log("[auth][jwt] received Google id_token");
        token.googleIdToken = account.id_token;

        try {
          console.log("[auth][jwt] sending id_token to backend:", backendUrl);
          const response = await fetch(`${backendUrl}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: account.id_token }),
            cache: "no-store",
          });

          console.log("[auth][jwt] backend response status:", response.status);

          if (response.ok) {
            const data = (await response.json()) as {
              accessToken: string;
              userStatus: "ACTIVE" | "INCOMPLETE";
            };

            token.backendAccessToken = data.accessToken;
            token.backendUserStatus = data.userStatus;
            console.log("[auth][jwt] backend auth success:", {
              userStatus: data.userStatus,
              hasAccessToken: Boolean(data.accessToken),
            });
          } else {
            token.backendUserStatus = "INCOMPLETE";
            const errorText = await response.text().catch(() => "");
            console.log("[auth][jwt] backend auth failed body:", errorText);
          }
        } catch (error) {
          token.backendUserStatus = "INCOMPLETE";
          console.log("[auth][jwt] backend auth exception:", error);
        }
      }

      if (trigger === "update") {
        if (session.backendAccessToken) {
          token.backendAccessToken = session.backendAccessToken;
        }

        if (session.backendUserStatus) {
          token.backendUserStatus = session.backendUserStatus;
        }

        console.log("[auth][jwt] session update applied:", {
          backendUserStatus: token.backendUserStatus,
          hasAccessToken: Boolean(token.backendAccessToken),
        });
      }

      return token;
    },
    async session({ session, token }) {
      session.backendAccessToken = token.backendAccessToken;
      session.backendUserStatus = token.backendUserStatus;
      console.log("[auth][session]", {
        backendUserStatus: session.backendUserStatus,
        hasAccessToken: Boolean(session.backendAccessToken),
        email: session.user?.email ?? null,
      });
      return session;
    },
  },
});
