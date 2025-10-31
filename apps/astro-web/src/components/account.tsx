import { UserCard } from "@krag/react-ui";
import {
	signOut,
	useSession,
	passkeyActions,
	useListPasskeys,
	twoFactorActions,
	updateUser,
	revokeSession,
} from "../lib/auth-client";
import type { Session } from "better-auth/types";
import type { ActiveSession } from "../types";

interface AccountProps {
	activeSessions: Session[];
	initialSession: ActiveSession | null;
}

export function Account({ activeSessions, initialSession }: AccountProps) {
	return (
		<div className="container mx-auto py-8">
			<UserCard
				activeSessions={activeSessions}
				initialSession={initialSession}
				useSession={useSession}
				signOut={signOut}
				updateUser={updateUser}
				revokeSession={revokeSession}
				passkeyActions={passkeyActions}
				useListPasskeys={useListPasskeys}
				twoFactorActions={twoFactorActions}
			/>
		</div>
	);
}
