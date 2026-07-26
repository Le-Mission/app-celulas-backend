import type { FastifyInstance } from "fastify";
import FastifySwagger from "@fastify/swagger";
import FastifySwaggerUi from "@fastify/swagger-ui";
import { env } from "../config/env.js";

export async function swaggerPlugin(app: FastifyInstance) {
  await app.register(FastifySwagger, {
    openapi: {
      openapi: "3.1.0",
      info: {
        title: "Le Mission API",
        description: "Multi-tenant SaaS backend for church management",
        version: "0.1.0",
      },
      servers: [
        {
          url: env.API_BASE_URL,
          description: env.NODE_ENV === "production" ? "Production" : "Development",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Clerk JWT token",
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  await app.register(FastifySwaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
  });
}
