import type { $Infer } from "@krag/better-auth";

// Infer session and user types from the auth client
export type Session = typeof $Infer.Session;
export type User = Session["user"];
