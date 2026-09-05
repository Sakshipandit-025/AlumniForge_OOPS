import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


//the "any"s are to be removed after proper forum setup
async function getCurrentAlumniForgeUser(ctx: any) {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
        throw new Error("You must be signed in.");
    }

    const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q: any) =>
            q.eq("clerkId", identity.subject)
        )
        .unique();

    if (user === null) {
        throw new Error("AlumniForge profile not found.");
    }

    return user;
}

export const listPosts = query({
    args: {},
    handler: async (ctx) => {
        const posts = await ctx.db
            .query("forumPosts")
            .order("desc")
            .collect();

        return await Promise.all(
            posts.map(async (post) => {
                const author = await ctx.db.get(post.authorId);

                return {
                    ...post,
                    authorName: author?.name ?? "Unknown user",
                };
            })
        );
    },
});

export const createPost = mutation({
    args: {
        title: v.string(),
        content: v.string(),
    },

    handler: async (ctx, args) => {
        const user = await getCurrentAlumniForgeUser(ctx);

        return await ctx.db.insert("forumPosts", {
            authorId: user._id,
            title: args.title,
            content: args.content,
            createdAt: Date.now(),
        });
    },
});

export const getPost = query({
    args: {
        postId: v.id("forumPosts"),
    },

    handler: async (ctx, args) => {
        const post = await ctx.db.get(args.postId);

        if (post === null) {
            return null;
        }

        const author = await ctx.db.get(post.authorId);

        const comments = await ctx.db
            .query("forumComments")
            .withIndex("by_post_id", (q) =>
                q.eq("postId", args.postId)
            )
            .order("asc")
            .collect();

        const commentsWithAuthors = await Promise.all(
            comments.map(async (comment) => {
                const commentAuthor = await ctx.db.get(comment.authorId);

                return {
                    ...comment,
                    authorName: commentAuthor?.name ?? "Unknown user",
                };
            })
        );

        return {
            ...post,
            authorName: author?.name ?? "Unknown user",
            comments: commentsWithAuthors,
        };
    },
});

export const addComment = mutation({
    args: {
        postId: v.id("forumPosts"),
        content: v.string(),
    },

    handler: async (ctx, args) => {
        const user = await getCurrentAlumniForgeUser(ctx);

        const post = await ctx.db.get(args.postId);

        if (post === null) {
            throw new Error("Post not found.");
        }

        return await ctx.db.insert("forumComments", {
            postId: args.postId,
            authorId: user._id,
            content: args.content,
            createdAt: Date.now(),
        });
    },
});

export const deletePost = mutation({
    args: {
        postId: v.id("forumPosts"),
    },

    handler: async (ctx, args) => {
        const user = await getCurrentAlumniForgeUser(ctx);

        const post = await ctx.db.get(args.postId);

        if (post === null) {
            throw new Error("Post not found.");
        }

        if (post.authorId !== user._id) {
            throw new Error("You can only delete your own posts.");
        }

        const comments = await ctx.db
            .query("forumComments")
            .withIndex("by_post_id", (q) =>
                q.eq("postId", args.postId)
            )
            .collect();

        for (const comment of comments) {
            await ctx.db.delete(comment._id);
        }

        await ctx.db.delete(args.postId);
 
        return true;
    },
});

