import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import admin from "firebase-admin";
import fs from "fs";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf-8'));

admin.initializeApp({
  projectId: firebaseConfig.projectId,
});

const db = admin.firestore();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24-preview' as any,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Stripe Webhook - MUST be before express.json() for raw body
  app.post("/api/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is missing");
      return res.status(400).send("Webhook secret missing");
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        
        if (userId) {
          console.log(`Payment successful for user: ${userId}`);
          try {
            await db.collection('users').doc(userId).set({
              isPremium: true,
              premiumSince: admin.firestore.FieldValue.serverTimestamp(),
              stripeSessionId: session.id
            }, { merge: true });
            console.log(`User ${userId} upgraded to Premium.`);
          } catch (dbErr) {
            console.error(`Error updating user ${userId}:`, dbErr);
          }
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  });

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/ai/openai", async (req, res) => {
    try {
      const { prompt, systemInstruction, responseMimeType, images } = req.body;

      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ error: "OpenAI API key not configured" });
      }

      const userContent: any[] = [{ type: "text", text: prompt }];
      if (images && images.length > 0) {
        for (const img of images) {
          userContent.push({
            type: "image_url",
            image_url: {
              url: img // OpenAI supports base64 data URLs directly
            }
          });
        }
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemInstruction || "You are a helpful assistant." },
          { role: "user", content: userContent }
        ],
        response_format: responseMimeType === "application/json" ? { type: "json_object" } : undefined,
      });

      res.json({ text: response.choices[0].message.content });
    } catch (error: any) {
      console.error("OpenAI Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
