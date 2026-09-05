import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users : defineTable({
        clerkId: v.string(),
        name: v.optional(v.string()),
        email: v.optional(v.string()),

        collegeEmail: v.optional(v.string()),
        dateOfBirth: v.optional(v.string()),
        graduationYear: v.optional(v.number()),
        branch: v.optional(v.string()),

        role: v.union(
            v.literal("admin"),
            v.literal("user")
        ),
        "createdAt": v.number()
    }).index("by_clerk_id", ["clerkId"])
});