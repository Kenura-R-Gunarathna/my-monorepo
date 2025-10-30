import { createAuthClient } from "better-auth/react";
import { passkeyClient, twoFactorClient } from "better-auth/client/plugins";

// Get the base URL from environment or default to localhost
const getBaseURL = () => {
	if (typeof window === 'undefined') {
		return process.env.API_URL || "http://localhost:4321";
	}
	return window.location.origin;
};

// React client for Better Auth
export const {
	signIn,
	signOut,
	signUp,
	useSession,
	passkey: passkeyActions,
	twoFactor: twoFactorActions,
	updateUser,
	changePassword,
} = createAuthClient({
	baseURL: getBaseURL(),
	plugins: [
		passkeyClient(),
		twoFactorClient({
			onTwoFactorRedirect: () => {
				window.location.href = "/two-factor";
			},
		}),
	],
});
