import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * EchoMasters Database Schema
 * Structured for real-time synchronization of academic progress and persistence.
 */
export default defineSchema({
  users: defineTable({
    hardwareId: v.string(), // Unique device/browser identifier
    xp: v.number(),
    coins: v.number(),
    level: v.number(),
    streak: v.number(),
    lastActive: v.number(),
    badges: v.array(v.string()),
    unlockedItems: v.array(v.string()),
    activeBoosters: v.array(v.string()),
    flashcardProgress: v.any(), // Record<string, FlashcardProgress>
    completedTopicIds: v.array(v.string()),
    userName: v.string(),
    userRole: v.string(),
    birthDate: v.optional(v.string()),
    birthTime: v.optional(v.string()),
    avatarId: v.string(),
    voiceId: v.string(),
    lastExamScore: v.number(),
    professorPersona: v.optional(v.string()),
    updatedAt: v.number(),
    // Persistence Upgrades
    lastInsight: v.optional(v.number()),
    insightText: v.optional(v.string()),
    vaultedScripts: v.optional(v.array(v.object({
      id: v.string(),
      title: v.string(),
      content: v.string(),
      timestamp: v.number()
    }))),
    assessmentReports: v.optional(v.array(v.any())),
    email: v.optional(v.string()),
    password: v.optional(v.string()),
    isPremium: v.optional(v.boolean()),
    subscriptionStatus: v.optional(v.string()), // 'free', 'premium', 'trial'
    customFlashcards: v.optional(v.array(v.object({
      id: v.string(),
      question: v.string(),
      answer: v.string(),
      category: v.string(),
      mnemonic: v.optional(v.string())
    }))),
  }).index("by_hardware_id", ["hardwareId"])
    .index("by_email", ["email"]),

  narrations: defineTable({
    contentHash: v.string(),
    voiceId: v.string(),
    audioData: v.string(),
    updatedAt: v.number(),
  }).index("by_hash", ["contentHash"]),
});
