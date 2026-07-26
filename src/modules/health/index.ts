import type { FastifyInstance } from "fastify";

export async function healthModule(app: FastifyInstance) {
  app.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  app.get("/ready", async (_request, reply) => {
    try {
      // Check database connectivity
      const { prisma } = await import("../../config/database.js");
      await prisma.$queryRaw`SELECT 1`;
      return { status: "ready", timestamp: new Date().toISOString() };
    } catch {
      reply.status(503);
      return { status: "not ready", timestamp: new Date().toISOString() };
    }
  });
}
