import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.API_URL || "http://localhost:4321",
});

// Export the $Infer type helper for type-safe session/user types
export const { $Infer } = authClient;
