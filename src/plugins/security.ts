import type { FastifyInstance } from "fastify";
import FastifyCors from "@fastify/cors";
import RateLimit from "@fastify/rate-limit";
import Helmet from "helmet";
import { corsConfig } from "../config/cors.js";

export async function securityPlugin(app: FastifyInstance) {
  // Helmet
  await app.register(async (childApp) => {
    childApp.addHook("onSend", async (_request, reply) => {
      const headers = Helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
      });
      for (const [key, value] of Object.entries(headers)) {
        if (value) reply.header(key, value);
      }
    });
  });

  // CORS
  await app.register(FastifyCors, corsConfig);

  // Rate limiting
  await app.register(RateLimit, {
    max: 100,
    timeWindow: "1 minute",
    errorResponseBuilder: () => ({
      error: {
        code: "RATE_LIMITED",
        message: "Muitas requisições. Tente novamente mais tarde.",
        details: {},
      },
    }),
  });
}
