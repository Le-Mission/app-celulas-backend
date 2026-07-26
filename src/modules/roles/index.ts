import type { FastifyInstance } from "fastify";

export async function rolesModule(app: FastifyInstance) {
  // Roles are seeded and managed via Prisma
  // This module provides read access to roles and permissions

  app.get("/roles", async () => {
    return { data: [] };
  });

  app.get("/permissions", async () => {
    return { data: [] };
  });
}
