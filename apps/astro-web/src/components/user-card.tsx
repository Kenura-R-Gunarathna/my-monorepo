"use client";

import { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
    Button,
    Avatar, 
    AvatarFallback, 
    AvatarImage 
} from "@krag/react-ui";
import { signOut, useSession } from "../lib/auth-client";

export function UserCard() {
	const { data: session, isPending } = useSession();

	const handleSignOut = async () => {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.href = "/";
				},
			},
		});
	};

	if (isPending) {
		return (
			<Card className="w-full">
				<CardContent className="pt-6">
					<p className="text-center">Loading...</p>
				</CardContent>
			</Card>
		);
	}

	if (!session) {
		return (
			<Card className="w-full">
				<CardContent className="pt-6">
					<p className="text-center">No active session</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>User Profile</CardTitle>
			</CardHeader>
			<CardContent className="grid gap-8">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-4">
						<Avatar>
							<AvatarImage src={session.user?.image || undefined} alt="User avatar" />
							<AvatarFallback>
								{session.user?.name?.charAt(0).toUpperCase() || "U"}
							</AvatarFallback>
						</Avatar>
						<div className="grid gap-1">
							<p className="text-sm font-medium leading-none">
								{session.user?.name || "Anonymous"}
							</p>
							<p className="text-sm text-muted-foreground">
								{session.user?.email}
							</p>
						</div>
					</div>
					<Button variant="destructive" onClick={handleSignOut}>
						Sign Out
					</Button>
				</div>
				<div className="border-l-2 px-4 space-y-2">
					<p className="text-xs font-medium text-muted-foreground">
						Session Information
					</p>
					<div className="space-y-1 text-sm">
						<p>
							<span className="font-medium">Session ID:</span>{" "}
							{session.session?.id?.substring(0, 20)}...
						</p>
						<p>
							<span className="font-medium">Created:</span>{" "}
							{session.session?.createdAt
								? new Date(session.session.createdAt).toLocaleString()
								: "N/A"}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
