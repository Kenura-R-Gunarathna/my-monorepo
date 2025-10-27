// Re-export auth server instance
export { auth } from "@/packages/better-auth/auth";

// Re-export auth client and type inference helper
export { authClient, $Infer } from "@/packages/better-auth/client";

export { user, session, account, verification } from "@/packages/better-auth/auth-schema";
