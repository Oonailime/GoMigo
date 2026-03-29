import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    backendAccessToken?: string;
    backendUserStatus?: "ACTIVE" | "INCOMPLETE";
    backendUserId?: number;
    backendAuthError?: "BACKEND_AUTH_FAILED";
    refreshBackendAuth?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    googleIdToken?: string;
    backendAccessToken?: string;
    backendUserStatus?: "ACTIVE" | "INCOMPLETE";
    backendUserId?: number;
    backendAuthError?: "BACKEND_AUTH_FAILED";
    refreshBackendAuth?: boolean;
  }
}
