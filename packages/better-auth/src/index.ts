// Re-export auth server instance
export { auth } from "./auth";

// Re-export auth client and type inference helper
export { authClient, $Infer } from "./client";

export { user, session, account, verification } from "./auth-schema";
