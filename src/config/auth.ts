import { env } from "./env.js";

export const clerkConfig = {
  publishableKey: env.CLERK_PUBLISHABLE_KEY,
  secretKey: env.CLERK_SECRET_KEY,
  webhookSecret: env.CLERK_WEBHOOK_SECRET,
  jwtAudience: env.CLERK_JWT_AUDIENCE,
};
