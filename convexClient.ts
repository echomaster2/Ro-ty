
import { ConvexReactClient } from "convex/react";

/**
 * EchoMasters Database Client
 * Handles the persistent real-time connection to the Acoustic Matrix metadata.
 */
const CONVEX_URL = process.env.CONVEX_URL || "https://missing-convex-url.convex.cloud";

export const convex = new ConvexReactClient(CONVEX_URL);
