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
    }).index("by_clerk_id", ["clerkId"]),

    forumPosts: defineTable({
        authorId: v.id("users"),
        title: v.string(),
        content: v.string(),
        createdAt: v.number()
    }).index("by_author_id", ["authorId"]),

    forumComments: defineTable({
        postId: v.id("forumPosts"),
        authorId: v.id("users"),
        content: v.string(),
        createdAt: v.number()
    }).index("by_post_id", ["postId"])
});