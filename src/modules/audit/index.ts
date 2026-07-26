import type { FastifyInstance } from "fastify";
import { prisma } from "../../config/database.js";
import { resolveAuthContext } from "../../core/tenancy/tenant-resolver.js";
import { AppError } from "../../core/errors/app-error.js";

export async function auditModule(app: FastifyInstance) {
  // List audit logs
  app.get("/audit", async (request) => {
    const authCtx = await resolveAuthContext(request);

    if (!authCtx.permissions.includes("audit.read")) throw AppError.forbidden();

    const { organizationId } = request.params as { organizationId?: string };
    const targetOrgId = organizationId ?? authCtx.organizationId;

    if (!targetOrgId) throw AppError.forbidden();

    const logs = await prisma.auditLog.findMany({
      where: { organizationId: targetOrgId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return {
      data: logs.map((l) => ({
        id: l.id,
        actorType: l.actorType,
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        metadataJson: l.metadataJson ? JSON.parse(l.metadataJson) : null,
        requestId: l.requestId,
        createdAt: l.createdAt,
      })),
    };
  });
}
