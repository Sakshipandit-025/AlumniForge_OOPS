import { mutation, query } from "./_generated/server";
import { v } from "convex/values"; 

export const getCurrentUser = query({
    args: {},

    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (identity === null) {
            return null;
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) =>
                q.eq("clerkId", identity.subject)
            )
            .unique();

        return user ?? null;
    },
});

export const createUser = mutation({
    args: {
        collegeEmail: v.string(),
        dateOfBirth: v.string(),
        graduationYear: v.number(),
        branch: v.string(),
    },

    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (identity === null) {
            throw new Error("You must be signed in to create a user.");
        }

        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) =>
                q.eq("clerkId", identity.subject)
            )
            .unique();

        if (existingUser !== null) {
            return existingUser;
        }

        const userId = await ctx.db.insert("users", {
            clerkId: identity.subject,
            name: identity.name,
            email: identity.email,
            collegeEmail: args.collegeEmail,
            dateOfBirth: args.dateOfBirth,
            graduationYear: args.graduationYear,
            branch: args.branch,
            role: "user",
            createdAt: Date.now(),
        });

        return await ctx.db.get(userId);
    },
});