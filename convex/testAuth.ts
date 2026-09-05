import { query } from "./_generated/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      return null;
    }

    return {
      subject: identity.subject,
      name: identity.name,
      email: identity.email,
    };
  },
});