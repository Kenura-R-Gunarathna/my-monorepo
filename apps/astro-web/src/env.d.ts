/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    session: {
      user: {
        id: string;
        email: string;
        name?: string | null;
        image?: string | null;
        emailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
      };
      session: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        expiresAt: Date;
        token: string;
        ipAddress?: string | null;
        userAgent?: string | null;
      };
    } | null;
  }
}
