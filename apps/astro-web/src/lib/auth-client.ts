import { passkeyClient, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { createAuthClient as createVanillaClient } from "better-auth/client";
import { getServerPublicConfig } from "@krag/config/public";

const config = getServerPublicConfig();
 
export const {
	signIn,
	signOut,
	useSession,
	signUp,
	passkey: passkeyActions,
	useListPasskeys,
	// twoFactor: twoFactorActions,
	$Infer,
	updateUser,
	changePassword,
	revokeSession,
	revokeSessions,
} = createAuthClient({
	baseURL: config.BETTER_AUTH_URL,
	plugins: [
		passkeyClient(),
		// twoFactorClient({
		// 	twoFactorPage: "/two-factor",
		// }),
	],
});

export const { useSession: useVanillaSession } = createVanillaClient({
	baseURL: config.BETTER_AUTH_URL,
});
