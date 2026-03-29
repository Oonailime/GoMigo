"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.signOut = exports.signIn = exports.handlers = exports.auth = void 0;
const next_auth_1 = __importDefault(require("next-auth"));
const google_1 = __importDefault(require("next-auth/providers/google"));
const backend_1 = require("./app/lib/backend");
function getJwtExp(token) {
    if (!token) {
        return undefined;
    }
    try {
        const [, payload] = token.split(".");
        if (!payload) {
            return undefined;
        }
        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        const decoded = JSON.parse(Buffer.from(normalized, "base64").toString("utf8"));
        return typeof decoded.exp === "number" ? decoded.exp : undefined;
    }
    catch {
        return undefined;
    }
}
_a = (0, next_auth_1.default)({
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    trustHost: process.env.AUTH_TRUST_HOST === "true" ||
        process.env.NODE_ENV !== "production",
    providers: [
        (0, google_1.default)({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, account, trigger, session }) {
            const exchangeGoogleTokenForBackendAuth = async (idToken) => {
                try {
                    const response = await fetch(`${backend_1.serverBackendUrl}/auth/google`, {
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
                    const data = (await response.json());
                    token.backendAccessToken = data.accessToken;
                    token.backendUserStatus = data.userStatus;
                    token.backendUserId = data.userId ?? undefined;
                    token.backendAuthError = undefined;
                }
                catch {
                    token.backendAccessToken = undefined;
                    token.backendUserStatus = undefined;
                    token.backendUserId = undefined;
                    token.backendAuthError = "BACKEND_AUTH_FAILED";
                }
            };
            if (account?.id_token) {
                token.googleIdToken = account.id_token;
                token.googleIdTokenExp = getJwtExp(account.id_token);
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
                    const nowInSeconds = Math.floor(Date.now() / 1000);
                    const googleTokenStillValid = typeof token.googleIdTokenExp === "number" &&
                        token.googleIdTokenExp > nowInSeconds + 60;
                    if (googleTokenStillValid) {
                        await exchangeGoogleTokenForBackendAuth(token.googleIdToken);
                    }
                    else {
                        token.backendAccessToken = undefined;
                        token.backendUserStatus = undefined;
                        token.backendUserId = undefined;
                        token.backendAuthError = "BACKEND_AUTH_FAILED";
                    }
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
}), exports.auth = _a.auth, exports.handlers = _a.handlers, exports.signIn = _a.signIn, exports.signOut = _a.signOut;
