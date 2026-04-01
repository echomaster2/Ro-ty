import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Retrieves a cached narration by content hash and voice ID.
 */
export const getCached = query({
  args: { contentHash: v.string(), voiceId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("narrations")
      .withIndex("by_hash", (q) => q.eq("contentHash", args.contentHash))
      .filter((q) => q.eq(q.field("voiceId"), args.voiceId))
      .unique();
  },
});

/**
 * Caches a new narration.
 */
export const cache = mutation({
  args: { 
    contentHash: v.string(), 
    voiceId: v.string(), 
    audioData: v.string() 
  },
  handler: async (ctx, args) => {
    // Check if already exists to avoid duplicates
    const existing = await ctx.db
      .query("narrations")
      .withIndex("by_hash", (q) => q.eq("contentHash", args.contentHash))
      .filter((q) => q.eq(q.field("voiceId"), args.voiceId))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("narrations", {
      contentHash: args.contentHash,
      voiceId: args.voiceId,
      audioData: args.audioData,
      updatedAt: Date.now(),
    });
  },
});
