import type { FastifyInstance } from "fastify";

export async function membershipsModule(app: FastifyInstance) {
  // Membership management is handled within organizations and churches modules
  // This module provides additional membership operations

  app.get("/memberships", async (request) => {
    void request;
    return { data: [], message: "Membership operations delegated to organization and church modules" };
  });
}
