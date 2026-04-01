# EchoMaster: Commercial Readiness Phased Plan

This document outlines the strategic roadmap to transition **EchoMaster: Physics Study Guide** from a development prototype to a production-ready commercial application.

## Phase 1: Monetization & Access Control (Current Focus)
**Goal:** Establish the "Free Tier" vs. "Premium" architecture.
- [x] **Database Schema Update**: Add `isPremium` and `role` to Firestore `users` table.
- [x] **Content Gating**: Implement logic in `CourseViewer` to lock advanced modules (e.g., Doppler, Hemodynamics) for free users.
- [x] **Checkout Integration**: Add "Upgrade to Premium" prompts and simulated checkout flow (Stripe-ready).
- [x] **Identity Sync Admin**: Refine Admin access to be tied to specific "Identity Nodes" rather than just a global password.

## Phase 2: Personalization & Onboarding
**Goal:** Enhance the "Calibration" experience to drive user engagement.
- [x] **Advanced Calibration Tool**: Implement the "Personalized Study Plan" generator using Name and Birthdate (Numerology/Astrology-inspired learning styles).
- [x] **Impact Vision**: Generate a "Mission Statement" for each user based on their calibration to inspire world-changing learning.
- [x] **Onboarding Flow**: Integrate Calibration into the first-time user experience.

## Phase 3: Performance & Cost Optimization
**Goal:** Reduce API costs and improve load times.
- [x] **Narration Caching**: Store generated TTS audio (Base64) in a `narrations` collection in Firestore, keyed by content hash.
- [x] **LuxTTS Integration**: Implement a fallback TTS engine for when Gemini/ElevenLabs credits are exhausted.
- [x] **Site Radio Resilience**: Fix autoplay and source issues to ensure background audio is reliable across all browsers.

## Phase 4: Commercial Polish & Launch
**Goal:** Finalize UI/UX and legal compliance.
- [x] **Design Refinement**: Polish the "Acoustic" aesthetic across all components.
- [x] **Analytics Dashboard**: Add an Admin view to track user progress, conversion rates, and popular modules.
- [x] **Legal & Compliance**: Finalize Terms of Service and Privacy Policy for commercial data handling.
- [x] **Mobile Optimization**: Ensure the "Acoustic Mobile Preview" is fully functional on real devices.
- [x] **Neural Marketplace**: Implement the "Shop" tab in Admin Studio to manage premium offerings.

---
*Plan initiated on March 25, 2026.*
