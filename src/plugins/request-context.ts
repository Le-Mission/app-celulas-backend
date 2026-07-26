import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";

export async function requestContextPlugin(app: FastifyInstance) {
  app.addHook("onRequest", async (request) => {
    const requestId = (request.headers["x-request-id"] as string) ?? randomUUID();
    request.id = requestId;
    request.headers["x-request-id"] = requestId;
  });

  app.addHook("onSend", async (request, reply) => {
    reply.header("x-request-id", request.id);
  });
}
