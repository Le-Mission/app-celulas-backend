import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../config/database.js";
import { resolveAuthContext } from "../../core/tenancy/tenant-resolver.js";
import { AppError } from "../../core/errors/app-error.js";
import { events } from "../../core/events/event-bus.js";

const createChurchSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  timezone: z.string().optional(),
});

export async function churchesModule(app: FastifyInstance) {
  // Create church
  app.post("/organizations/:organizationId/churches", async (request, reply) => {
    const authCtx = await resolveAuthContext(request);
    const { organizationId } = request.params as { organizationId: string };

    if (authCtx.organizationId !== organizationId) throw AppError.forbidden();
    if (!authCtx.permissions.includes("church.manage")) throw AppError.forbidden();

    const body = createChurchSchema.parse(request.body);

    const church = await prisma.church.create({
      data: {
        organizationId,
        name: body.name,
        slug: body.slug,
        timezone: body.timezone,
        memberships: {
          create: {
            userId: authCtx.userId,
            role: "CHURCH_ADMIN",
          },
        },
      },
    });

    await events.churchCreated(church.id, {
      organizationId,
      name: church.name,
      slug: church.slug,
    });

    return reply.status(201).send({
      data: {
        id: church.id,
        organizationId: church.organizationId,
        name: church.name,
        slug: church.slug,
        status: church.status,
        createdAt: church.createdAt,
      },
    });
  });

  // List churches in organization
  app.get("/organizations/:organizationId/churches", async (request) => {
    const authCtx = await resolveAuthContext(request);
    const { organizationId } = request.params as { organizationId: string };

    if (authCtx.organizationId !== organizationId) throw AppError.forbidden();

    const churches = await prisma.church.findMany({
      where: { organizationId },
    });

    return {
      data: churches.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        status: c.status,
        timezone: c.timezone,
        createdAt: c.createdAt,
      })),
    };
  });

  // Get church
  app.get("/organizations/:organizationId/churches/:churchId", async (request) => {
    const authCtx = await resolveAuthContext(request);
    const { organizationId, churchId } = request.params as {
      organizationId: string;
      churchId: string;
    };

    if (authCtx.organizationId !== organizationId) throw AppError.forbidden();

    const church = await prisma.church.findFirst({
      where: { id: churchId, organizationId },
      include: {
        cells: true,
        memberships: {
          include: { user: { select: { id: true, name: true, primaryEmail: true } } },
        },
      },
    });

    if (!church) throw AppError.notFound();

    return {
      data: {
        id: church.id,
        name: church.name,
        slug: church.slug,
        status: church.status,
        timezone: church.timezone,
        cells: church.cells.map((c) => ({
          id: c.id,
          name: c.name,
        })),
        members: church.memberships.map((m) => ({
          userId: m.user.id,
          name: m.user.name,
          email: m.user.primaryEmail,
          role: m.role,
        })),
        createdAt: church.createdAt,
      },
    };
  });

  // Update church
  app.patch("/organizations/:organizationId/churches/:churchId", async (request) => {
    const authCtx = await resolveAuthContext(request);
    const { organizationId, churchId } = request.params as {
      organizationId: string;
      churchId: string;
    };

    if (authCtx.organizationId !== organizationId) throw AppError.forbidden();
    if (!authCtx.permissions.includes("church.manage")) throw AppError.forbidden();

    const body = request.body as { name?: string; timezone?: string };

    const church = await prisma.church.findFirst({
      where: { id: churchId, organizationId },
    });
    if (!church) throw AppError.notFound();

    const updated = await prisma.church.update({
      where: { id: churchId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.timezone !== undefined && { timezone: body.timezone }),
      },
    });

    return {
      data: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        status: updated.status,
        timezone: updated.timezone,
      },
    };
  });
}
