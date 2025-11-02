import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { passkey } from "better-auth/plugins/passkey";
import { twoFactor } from "better-auth/plugins";
import { getServerConfig } from "@krag/config/server";
import { dbConn } from "@krag/drizzle-orm-server";

const config = getServerConfig();

const authConfig = {
  database: drizzleAdapter(dbConn, {
    provider: "mysql",
    usePlural: false,
  }),
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["google"],
		},
	},
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  socialProviders: {
    google: {
      clientId: config.GOOGLE_CLIENT_ID ?? "",
      clientSecret: config.GOOGLE_CLIENT_SECRET ?? "",
      redirectURI: `${config.BASE_URL}/api/auth/callback/google`,
    },
    github: {
      clientId: config.GITHUB_CLIENT_ID ?? "",
      clientSecret: config.GITHUB_CLIENT_SECRET ?? "",
      redirectURI: `${config.BASE_URL}/api/auth/callback/github`,
    },
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
	plugins: [
		passkey(),
		twoFactor({
			otpOptions: {
				async sendOTP({ user, otp }) {
					console.log(`Sending OTP to ${user.email}: ${otp}`);
					// await resend.emails.send({
					// 	from: "Acme <no-reply@demo.better-auth.com>",
					// 	to: user.email,
					// 	subject: "Your OTP",
					// 	html: `Your OTP is ${otp}`,
					// });
				},
			},
		}),
	],
	rateLimit: {
		enabled: true,
	},
  trustedOrigins: [config.BASE_URL],
} satisfies BetterAuthOptions;

export const auth = betterAuth(authConfig) as any;

export type Auth = typeof auth;