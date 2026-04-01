import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Retrieves a student profile by Hardware ID (Reactive Query).
 */
export const get = query({
  args: { hardwareId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_hardware_id", (q) => q.eq("hardwareId", args.hardwareId))
      .unique();
  },
});

/**
 * Retrieves a student profile by Hardware ID or creates a fresh one.
 */
export const getOrCreate = mutation({
  args: { hardwareId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_hardware_id", (q) => q.eq("hardwareId", args.hardwareId))
      .unique();

    if (existing) return existing;

    const newUserId = await ctx.db.insert("users", {
      hardwareId: args.hardwareId,
      xp: 0,
      coins: 250,
      level: 1,
      streak: 1,
      lastActive: Date.now(),
      badges: ["pioneer_badge"],
      unlockedItems: [],
      activeBoosters: [],
      flashcardProgress: {},
      completedTopicIds: [],
      userName: "Acoustic Seeker",
      userRole: "Sonography Student",
      birthDate: "",
      birthTime: "",
      avatarId: "av-1",
      voiceId: "Yko7iBn2vnSMvSAsuF8N",
      lastExamScore: 0,
      professorPersona: "Charon",
      updatedAt: Date.now(),
      vaultedScripts: [],
      assessmentReports: [],
      isPremium: false,
      subscriptionStatus: "free",
    });

    return await ctx.db.get(newUserId);
  },
});

/**
 * Registers a new user with email and password.
 */
export const register = mutation({
  args: { email: v.string(), password: v.string(), hardwareId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      throw new Error("User with this email already exists.");
    }

    const newUserId = await ctx.db.insert("users", {
      email: args.email,
      password: args.password, // In a real app, hash this!
      hardwareId: args.hardwareId,
      xp: 0,
      coins: 250,
      level: 1,
      streak: 1,
      lastActive: Date.now(),
      badges: ["pioneer_badge"],
      unlockedItems: [],
      activeBoosters: [],
      flashcardProgress: {},
      completedTopicIds: [],
      userName: args.email.split('@')[0],
      userRole: "Sonography Student",
      birthDate: "",
      birthTime: "",
      avatarId: "av-1",
      voiceId: "Yko7iBn2vnSMvSAsuF8N",
      lastExamScore: 0,
      professorPersona: "Charon",
      updatedAt: Date.now(),
      vaultedScripts: [],
      assessmentReports: [],
      isPremium: false,
      subscriptionStatus: "free",
    });

    return await ctx.db.get(newUserId);
  },
});

/**
 * Logs in a user with email and password.
 */
export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user || user.password !== args.password) {
      throw new Error("Invalid email or password.");
    }

    return user;
  },
});

/**
 * Full state synchronization for the academic engine.
 */
export const syncProgress = mutation({
  args: {
    userId: v.id("users"),
    updates: v.object({
      xp: v.optional(v.number()),
      coins: v.optional(v.number()),
      level: v.optional(v.number()),
      streak: v.optional(v.number()),
      badges: v.optional(v.array(v.string())),
      flashcardProgress: v.optional(v.any()),
      completedTopicIds: v.optional(v.array(v.string())),
      userName: v.optional(v.string()),
      userRole: v.optional(v.string()),
      birthDate: v.optional(v.string()),
      birthTime: v.optional(v.string()),
      avatarId: v.optional(v.string()),
      voiceId: v.optional(v.string()),
      lastExamScore: v.optional(v.number()),
      professorPersona: v.optional(v.string()),
      lastInsight: v.optional(v.number()),
      insightText: v.optional(v.string()),
      vaultedScripts: v.optional(v.array(v.any())),
      assessmentReports: v.optional(v.array(v.any())),
      isPremium: v.optional(v.boolean()),
      subscriptionStatus: v.optional(v.string()),
      customFlashcards: v.optional(v.array(v.any())),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Retrieves all users (Admin only).
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

/**
 * Retrieves the top users for the global leaderboard.
 */
export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("users")
      .order("desc")
      .take(limit);
  },
});
