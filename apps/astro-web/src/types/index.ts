import type { Session, User } from "better-auth/types";

export interface ActiveSession {
	session: Session;
	user: User;
}
