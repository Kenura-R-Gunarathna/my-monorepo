import crypto from "crypto";
import { betterAuth } from "better-auth";
import type { BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getWebDb } from "@krag/database-web";
import * as schema from "@krag/database-web/src/schema";
import { config } from "@krag/config-astro";

const db = getWebDb();

const authConfig = {
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
    usePlural: false,
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirectURI:
        config.NODE_ENV === "production"
          ? "https://yourdomain.com/api/auth/callback/google"
          : `${config.API_URL}/api/auth/callback/google`,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      redirectURI:
        config.NODE_ENV === "production"
          ? "https://yourdomain.com/api/auth/callback/github"
          : `${config.API_URL}/api/auth/callback/github`,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: { enabled: true, maxAge: 5 * 60 }, // 5 minutes
  },

  advanced: {
    generateId: () => crypto.randomUUID(),
    useSecureCookies: config.NODE_ENV === "production",
  },

  user: {
    additionalFields: {
      roleId: { type: "number", required: false, input: false },
      isActive: { type: "boolean", required: false, defaultValue: true },
      phoneNumber: { type: "string", required: false },
      firstName: { type: "string", required: false },
      lastName: { type: "string", required: false },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              roleId: user.roleId ?? 3, // Default to basic user role
              isActive: true,
            },
          };
        },
      },
    },
  },

  trustedOrigins: [config.API_URL],
} satisfies BetterAuthOptions;

// Use 'as any' to avoid the portability issue with deep type inference
export const auth = betterAuth(authConfig) as any;

export type Auth = typeof auth;