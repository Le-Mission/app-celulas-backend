import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../config/database.js";
import { resolveAuthContext } from "../../core/tenancy/tenant-resolver.js";
import { AppError } from "../../core/errors/app-error.js";

const createCellSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  meetingDay: z.string().optional(),
  meetingTime: z.string().optional(),
});

export async function cellsModule(app: FastifyInstance) {
  // Create cell
  app.post("/churches/:churchId/cells", async (request, reply) => {
    const authCtx = await resolveAuthContext(request);
    const { churchId } = request.params as { churchId: string };

    if (!authCtx.permissions.includes("cells.create")) throw AppError.forbidden();

    // Verify church access
    const church = await prisma.church.findUnique({ where: { id: churchId } });
    if (!church) throw AppError.notFound();
    if (church.organizationId !== authCtx.organizationId) throw AppError.forbidden();

    const body = createCellSchema.parse(request.body);

    const cell = await prisma.cell.create({
      data: {
        churchId,
        name: body.name,
        description: body.description,
        leaderId: authCtx.userId,
        meetingDay: body.meetingDay,
        meetingTime: body.meetingTime,
        memberships: {
          create: {
            userId: authCtx.userId,
            role: "LEADER",
          },
        },
      },
    });

    return reply.status(201).send({
      data: {
        id: cell.id,
        churchId: cell.churchId,
        name: cell.name,
        description: cell.description,
        leaderId: cell.leaderId,
        meetingDay: cell.meetingDay,
        meetingTime: cell.meetingTime,
        createdAt: cell.createdAt,
      },
    });
  });

  // List cells in church
  app.get("/churches/:churchId/cells", async (request) => {
    const authCtx = await resolveAuthContext(request);
    const { churchId } = request.params as { churchId: string };

    const church = await prisma.church.findUnique({ where: { id: churchId } });
    if (!church) throw AppError.notFound();
    if (church.organizationId !== authCtx.organizationId) throw AppError.forbidden();

    const cells = await prisma.cell.findMany({
      where: { churchId },
      include: { memberships: true },
    });

    return {
      data: cells.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        leaderId: c.leaderId,
        meetingDay: c.meetingDay,
        meetingTime: c.meetingTime,
        memberCount: c.memberships.length,
        createdAt: c.createdAt,
      })),
    };
  });

  // Get cell
  app.get("/churches/:churchId/cells/:cellId", async (request) => {
    const authCtx = await resolveAuthContext(request);
    const { churchId, cellId } = request.params as { churchId: string; cellId: string };

    const church = await prisma.church.findUnique({ where: { id: churchId } });
    if (!church) throw AppError.notFound();
    if (church.organizationId !== authCtx.organizationId) throw AppError.forbidden();

    const cell = await prisma.cell.findFirst({
      where: { id: cellId, churchId },
      include: {
        memberships: {
          include: { user: { select: { id: true, name: true, primaryEmail: true } } },
        },
      },
    });

    if (!cell) throw AppError.notFound();

    return {
      data: {
        id: cell.id,
        name: cell.name,
        description: cell.description,
        leaderId: cell.leaderId,
        meetingDay: cell.meetingDay,
        meetingTime: cell.meetingTime,
        members: cell.memberships.map((m) => ({
          userId: m.user.id,
          name: m.user.name,
          email: m.user.primaryEmail,
          role: m.role,
        })),
        createdAt: cell.createdAt,
      },
    };
  });

  // Update cell
  app.patch("/churches/:churchId/cells/:cellId", async (request) => {
    const authCtx = await resolveAuthContext(request);
    const { churchId, cellId } = request.params as { churchId: string; cellId: string };

    const cell = await prisma.cell.findFirst({ where: { id: cellId, churchId } });
    if (!cell) throw AppError.notFound();

    // Contextual auth: LEADER can only edit cells they lead
    if (authCtx.cellRole === "LEADER" && cell.leaderId !== authCtx.userId) {
      throw AppError.forbidden("Você só pode editar células que lidera.");
    }
    if (!authCtx.permissions.includes("cells.update")) throw AppError.forbidden();

    const body = request.body as { name?: string; description?: string; meetingDay?: string; meetingTime?: string };

    const updated = await prisma.cell.update({
      where: { id: cellId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.meetingDay !== undefined && { meetingDay: body.meetingDay }),
        ...(body.meetingTime !== undefined && { meetingTime: body.meetingTime }),
      },
    });

    return {
      data: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        leaderId: updated.leaderId,
        meetingDay: updated.meetingDay,
        meetingTime: updated.meetingTime,
      },
    };
  });

  // Delete cell
  app.delete("/churches/:churchId/cells/:cellId", async (request) => {
    const authCtx = await resolveAuthContext(request);
    const { churchId, cellId } = request.params as { churchId: string; cellId: string };

    if (!authCtx.permissions.includes("cells.delete")) throw AppError.forbidden();

    const cell = await prisma.cell.findFirst({ where: { id: cellId, churchId } });
    if (!cell) throw AppError.notFound();

    await prisma.cell.delete({ where: { id: cellId } });

    return { data: { deleted: true } };
  });
}
