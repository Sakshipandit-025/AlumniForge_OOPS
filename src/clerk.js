import { Clerk } from "@clerk/clerk-js";

export const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
    throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env");
}

export const clerk = new Clerk(publishableKey);