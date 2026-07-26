import type { FastifyInstance } from "fastify";
import { clerkPlugin, getAuth } from "@clerk/fastify";
import { clerkConfig } from "../config/auth.js";
import { AppError } from "../core/errors/app-error.js";

export async function authPlugin(app: FastifyInstance) {
  await app.register(clerkPlugin, {
    publishableKey: clerkConfig.publishableKey,
    secretKey: clerkConfig.secretKey,
    ...(clerkConfig.jwtAudience ? { jwtAudience: clerkConfig.jwtAudience } : {}),
  });

  // Decorator to get auth context
  app.decorate("getAuthContext", function (this: FastifyInstance, request: { auth?: unknown }) {
    const auth = getAuth(request as Parameters<typeof getAuth>[0]);
    if (!auth?.userId) {
      throw AppError.unauthenticated();
    }
    return {
      clerkUserId: auth.userId,
      sessionId: auth.sessionId,
    };
  });
}

// Type augmentation for Fastify
declare module "fastify" {
  interface FastifyInstance {
    getAuthContext: (request: { auth?: unknown }) => {
      clerkUserId: string;
      sessionId: string;
    };
  }
}
