import { useState } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { UAParser } from "ua-parser-js";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { Session, User } from "better-auth/types";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { convertImageToBase64 } from "../../lib/utils";
import { Loader } from "../loader";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../ui/table";// Re-export auth types from centralized schema package
import type {
	// User,
	// Session,
	// Account,
	// ExtendedUser,
	ActiveSession,
	// ExtendedActiveSession,
	// UserSessionData
} from '@krag/zod-schema'

interface UserWithTwoFactor extends User {
	twoFactorEnabled?: boolean;
}

interface ErrorResponse {
	error?: {
		message: string;
	};
}

interface UserCardProps {
	activeSessions: Session[];
	initialSession: ActiveSession | null;
	useSession: () => { data: ActiveSession | null; isPending: boolean; error: Error | null };
	signOut: () => Promise<void>;
	updateUser: (data: { name?: string; image?: string }) => Promise<ErrorResponse | void>;
	revokeSession: (data: { token: string }) => Promise<ErrorResponse>;
	passkeyActions: {
		addPasskey: (data: { name?: string }) => Promise<ErrorResponse | void>;
		deletePasskey: (data: { id: string }) => Promise<void>;
	};
	useListPasskeys: () => { data: Array<{ id: string; name?: string }> | undefined; isPending: boolean };
	twoFactorActions: {
		enable: (data: { password: string }) => Promise<void>;
		disable: (data: { password: string }) => Promise<void>;
	};
}

export function UserCard({
	activeSessions,
	initialSession,
	useSession,
	signOut,
	updateUser,
	revokeSession,
	passkeyActions,
	useListPasskeys,
	twoFactorActions,
}: UserCardProps) {
	const { data: session } = useSession();
	const currentSession = session || initialSession;

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>User</CardTitle>
			</CardHeader>
			<CardContent className="grid gap-8 grid-cols-1">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-4">
						<Avatar>
							<AvatarImage src={currentSession?.user.image || undefined} alt="picture" />
							<AvatarFallback>{currentSession?.user.name.charAt(0)}</AvatarFallback>
						</Avatar>
						<div className="grid gap-1">
							<p className="text-sm font-medium leading-none">
								{currentSession?.user.name}
							</p>
							<p className="text-sm">{currentSession?.user.email}</p>
						</div>
					</div>
					<EditUserDialog user={currentSession?.user} updateUser={updateUser} />
				</div>
				<div className="border-l-2 px-2 w-max gap-1 flex flex-col">
					<p className="text-xs font-medium ">Active Sessions</p>
					{activeSessions.map((activeSession) => {
						const parser = new UAParser(activeSession.userAgent || undefined);
						const deviceType = parser.getDevice().type;
						const osName = parser.getOS().name;
						const browserName = parser.getBrowser().name;

						return (
							<div key={activeSession.id}>
								<div className="flex items-center gap-2 text-sm text-black font-medium dark:text-white">
									{deviceType === "mobile" ? (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="1em"
											height="1em"
											viewBox="0 0 24 24"
										>
											<path
												fill="currentColor"
												d="M15.5 1h-8A2.5 2.5 0 0 0 5 3.5v17A2.5 2.5 0 0 0 7.5 23h8a2.5 2.5 0 0 0 2.5-2.5v-17A2.5 2.5 0 0 0 15.5 1m-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5m4.5-4H7V4h9z"
											/>
										</svg>
									) : (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="1em"
											height="1em"
											viewBox="0 0 24 24"
										>
											<path
												fill="currentColor"
												d="M0 20v-2h4v-1q-.825 0-1.412-.587T2 15V5q0-.825.588-1.412T4 3h16q.825 0 1.413.588T22 5v10q0 .825-.587 1.413T20 17v1h4v2zm4-5h16V5H4zm0 0V5z"
											/>
										</svg>
									)}
									{osName}, {browserName}
									<button
										className="text-red-500 opacity-80 cursor-pointer text-xs border-muted-foreground border-red-600 underline"
										onClick={async () => {
											const res = await revokeSession({
												token: activeSession.token,
											});

											if (res.error) {
												alert(res.error.message);
											} else {
												alert("Session terminated");
												window.location.reload();
											}
										}}
									>
										{activeSession.id === currentSession?.session.id
											? "Sign Out"
											: "Terminate"}
									</button>
								</div>
							</div>
						);
					})}
				</div>
				<div className="flex items-center justify-between">
					<Button
						variant="outline"
						className="gap-2"
						onClick={async () => {
							await signOut();
							window.location.reload();
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="1.2em"
							height="1.2em"
							viewBox="0 0 24 24"
						>
							<path
								fill="currentColor"
								d="M9 20.75H6a2.64 2.64 0 0 1-2.75-2.53V5.78A2.64 2.64 0 0 1 6 3.25h3a.75.75 0 0 1 0 1.5H6a1.16 1.16 0 0 0-1.25 1v12.47a1.16 1.16 0 0 0 1.25 1h3a.75.75 0 0 1 0 1.5Zm7-4a.74.74 0 0 1-.53-.22a.75.75 0 0 1 0-1.06L18.94 12l-3.47-3.47a.75.75 0 1 1 1.06-1.06l4 4a.75.75 0 0 1 0 1.06l-4 4a.74.74 0 0 1-.53.22"
							/>
							<path
								fill="currentColor"
								d="M20 12.75H9a.75.75 0 0 1 0-1.5h11a.75.75 0 0 1 0 1.5"
							/>
						</svg>
						Sign Out
					</Button>
					<div>
						<TwoFactorDialog
							enabled={(currentSession?.user as UserWithTwoFactor)?.twoFactorEnabled}
							twoFactorActions={twoFactorActions}
						/>
					</div>
				</div>
				<div className="border-y py-4 flex items-center flex-wrap justify-between gap-2">
					<div className="flex flex-col gap-2">
						<p className="text-sm">Passkeys</p>
						<div className="flex gap-2 flex-wrap">
							<AddPasskeyDialog passkeyActions={passkeyActions} />
							<ListPasskeys passkeyActions={passkeyActions} useListPasskeys={useListPasskeys} />
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function EditUserDialog({
	user,
	updateUser,
}: {
	user?: User;
	updateUser: (data: { name?: string; image?: string }) => Promise<ErrorResponse | void>;
}) {
	const [isLoading, setIsLoading] = useState(false);
	const [image, setImage] = useState<File>();
	const [name, setName] = useState<string>();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Dialog onOpenChange={setIsOpen} open={isOpen}>
			<DialogTrigger asChild>
				<Button variant="secondary">Edit User</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit User</DialogTitle>
					<DialogDescription>Edit User Information</DialogDescription>
				</DialogHeader>
				<div className="grid gap-2">
					<div className="grid gap-2">
						<Label htmlFor="full-name">Full Name</Label>
						<Input
							id="full-name"
							placeholder={user?.name}
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="profile-image">Profile Image</Label>
						<Input
							id="profile-image"
							type="file"
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								const file = e.target.files?.[0];
								setImage(file);
							}}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button
						onClick={async () => {
							setIsLoading(true);
							try {
								await updateUser({
									image: image ? await convertImageToBase64(image) : undefined,
									name: name,
								});
								alert("User Updated Successfully");
								setIsOpen(false);
							} catch (error) {
								const message = error instanceof Error ? error.message : "Failed to update user";
								alert(message);
							} finally {
								setIsLoading(false);
							}
						}}
					>
						{isLoading ? <Loader /> : "Update"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function AddPasskeyDialog({
	passkeyActions,
}: {
	passkeyActions: UserCardProps["passkeyActions"];
}) {
	const [name, setName] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline">Add Passkey</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Register New Passkey</DialogTitle>
					<DialogDescription>
						Add a new passkey to your account
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-2">
					<div className="grid gap-2">
						<Label htmlFor="passkey-name">
							Passkey Name (optional)
						</Label>
						<Input
							id="passkey-name"
							type="text"
							placeholder="My Passkey"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button
						onClick={async () => {
							setIsLoading(true);
							try {
								const res = await passkeyActions.addPasskey({ name });
								if (res && 'error' in res && res.error) {
									alert(res.error.message);
								} else {
									alert("Successfully added");
									setName("");
								}
							} catch (error) {
								const message = error instanceof Error ? error.message : "Failed to add passkey";
								alert(message);
							} finally {
								setIsLoading(false);
							}
						}}
					>
						{isLoading ? (
							<Loader />
						) : (
							<div className="flex items-center gap-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="1.2em"
									height="1.2em"
									viewBox="0 0 24 24"
								>
									<path
										fill="currentColor"
										d="M3.25 9.65q-.175-.125-.213-.312t.113-.388q1.55-2.125 3.888-3.3t4.987-1.175q2.65 0 5 1.138T20.95 8.9q.175.225.113.4t-.213.3q-.15.125-.35.113t-.35-.213q-1.375-1.95-3.537-2.987t-4.588-1.038q-2.425 0-4.55 1.038T3.95 9.5q-.15.225-.35.25t-.35-.1m11.6 12.325q-2.6-.65-4.25-2.588T8.95 14.65q0-1.25.9-2.1t2.175-.85q1.275 0 2.175.85t.9 2.1q0 .825.625 1.388t1.475.562q.85 0 1.45-.562t.6-1.388q0-2.9-2.125-4.875T12.05 7.8q-2.95 0-5.075 1.975t-2.125 4.85q0 .6.113 1.5t.537 2.1q.075.225-.012.4t-.288.25q-.2.075-.387-.012t-.263-.288q-.375-.975-.537-1.937T3.85 14.65q0-3.325 2.413-5.575t5.762-2.25q3.375 0 5.8 2.25t2.425 5.575q0 1.25-.887 2.087t-2.163.838q-1.275 0-2.187-.837T14.1 14.65q0-.825-.612-1.388t-1.463-.562q-.85 0-1.463.563T9.95 14.65q0 2.425 1.438 4.05t3.712 2.275q.225.075.3.25t.025.375q-.05.175-.2.3t-.375.075M6.5 4.425q-.2.125-.4.063t-.3-.263q-.1-.2-.05-.362T6 3.575q1.4-.75 2.925-1.15t3.1-.4q1.6 0 3.125.388t2.95 1.112q.225.125.263.3t-.038.35q-.075.175-.25.275t-.425-.025q-1.325-.675-2.738-1.037t-2.887-.363q-1.45 0-2.85.338T6.5 4.425m2.95 17.2q-1.475-1.55-2.262-3.162T6.4 14.65q0-2.275 1.65-3.838t3.975-1.562q2.325 0 4 1.563T17.7 14.65q0 .225-.137.363t-.363.137q-.2 0-.35-.137t-.15-.363q0-1.875-1.388-3.137t-3.287-1.263q-1.9 0-3.262 1.263T7.4 14.65q0 2.025.7 3.438t2.05 2.837q.15.15.15.35t-.15.35q-.15.15-.35.15t-.35-.15m7.55-1.7q-2.225 0-3.863-1.5T11.5 14.65q0-.2.138-.35t.362-.15q.225 0 .363.15t.137.35q0 1.875 1.35 3.075t3.15 1.2q.15 0 .425-.025t.575-.075q.225-.05.388.063t.212.337q.05.2-.075.35t-.325.2q-.45.125-.787.138t-.413.012"
									/>
								</svg>
								Add Passkey
							</div>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function ListPasskeys({
	passkeyActions,
	useListPasskeys,
}: {
	passkeyActions: UserCardProps["passkeyActions"];
	useListPasskeys: UserCardProps["useListPasskeys"];
}) {
	const { data: passkeys } = useListPasskeys();
	const [isDeletePasskey, setIsDeletePasskey] = useState(false);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline">
					Passkeys {passkeys?.length ? `[${passkeys?.length}]` : ""}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Passkeys</DialogTitle>
					<DialogDescription>List of passkeys</DialogDescription>
				</DialogHeader>
				{passkeys?.length ? (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{passkeys?.map((passkey) => (
								<TableRow key={passkey.id} className="flex justify-between items-center">
									<TableCell>{passkey.name || "My Passkey"}</TableCell>
									<TableCell className="text-right">
										<button
											onClick={async () => {
												setIsDeletePasskey(true);
												try {
													await passkeyActions.deletePasskey({
														id: passkey.id,
													});
													alert("Passkey deleted successfully");
												} catch (error) {
													const message = error instanceof Error ? error.message : "Failed to delete passkey";
													alert(message);
												} finally {
													setIsDeletePasskey(false);
												}
											}}
										>
											{isDeletePasskey ? (
												<Loader />
											) : (
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="1em"
													height="1em"
													viewBox="0 0 24 24"
												>
													<path
														fill="currentColor"
														d="M5 21V6H4V4h5V3h6v1h5v2h-1v15zm2-2h10V6H7zm2-2h2V8H9zm4 0h2V8h-2zM7 6v13z"
													/>
												</svg>
											)}
										</button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				) : (
					<p className="text-sm text-muted-foreground">No passkeys found</p>
				)}
			</DialogContent>
		</Dialog>
	);
}

function TwoFactorDialog({
	enabled,
	twoFactorActions,
}: {
	enabled?: boolean;
	twoFactorActions: UserCardProps["twoFactorActions"];
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [password, setPassword] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);

	return (
		<Dialog onOpenChange={setIsOpen} open={isOpen}>
			<DialogTrigger asChild>
				<Button variant="secondary">
					{enabled ? "Disable 2FA" : "Enable 2FA"}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Enable Two Factor</DialogTitle>
					<DialogDescription>
						Enable two factor authentication
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-2">
					<div className="grid gap-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button
						onClick={async () => {
							if (!password) {
								alert("Password is required!");
								return;
							}
							setIsLoading(true);
							try {
								if (enabled) {
									await twoFactorActions.disable({ password });
									alert("Two factor is disabled!");
								} else {
									await twoFactorActions.enable({ password });
									alert("Two factor successfully enabled!");
								}
								setIsOpen(false);
							} catch (error) {
								const message = error instanceof Error ? error.message : "Failed to update 2FA";
								alert(message);
							} finally {
								setIsLoading(false);
							}
						}}
					>
						{isLoading ? <Loader /> : <p>{enabled ? "Disable" : "Enable"}</p>}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}