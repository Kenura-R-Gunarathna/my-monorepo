import { betterAuth } from "better-auth";
import { passkey } from "better-auth/plugins/passkey";
import { twoFactor } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getWebDb } from "@krag/database-web";
import * as schema from "@krag/database-web/src/schema";
import { config } from "@krag/config-astro";

const db = getWebDb();

export const auth = betterAuth({
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
	
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["google", "github"],
		},
	},
	
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
		minPasswordLength: 8,
	},
	
	socialProviders: {
		google: {
			clientId: config.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: config.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
			redirectURI:
				config.NODE_ENV === "production"
					? "https://yourdomain.com/api/auth/callback/google"
					: `${config.API_URL}/api/auth/callback/google`,
		},
		github: {
			clientId: config.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID || "",
			clientSecret: config.GITHUB_CLIENT_SECRET || process.env.GITHUB_CLIENT_SECRET || "",
			redirectURI:
				config.NODE_ENV === "production"
					? "https://yourdomain.com/api/auth/callback/github"
					: `${config.API_URL}/api/auth/callback/github`,
		},
	},
	
	plugins: [
		passkey(),
		twoFactor({
			otpOptions: {
				async sendOTP({ user }, otp) {
					console.log(`Sending OTP to ${user.email}: ${otp}`);
					// TODO: Integrate with Resend or your email service
					// if (config.RESEND_API_KEY) {
					//   const resend = new Resend(config.RESEND_API_KEY);
					//   await resend.emails.send({
					//     from: "no-reply@yourdomain.com",
					//     to: user.email,
					//     subject: "Your OTP Code",
					//     html: `Your OTP is ${otp}`,
					//   });
					// }
				},
			},
		}),
	],
	
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
		cookieCache: { enabled: true, maxAge: 5 * 60 }, // 5 minutes
	},
	
	rateLimit: {
		enabled: true,
	},
	
	advanced: {
		useSecureCookies: config.NODE_ENV === "production",
	},
	
	trustedOrigins: [config.API_URL],
});

export type Auth = typeof auth;
