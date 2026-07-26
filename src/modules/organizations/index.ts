import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../config/database.js";
import { resolveAuthContext } from "../../core/tenancy/tenant-resolver.js";
import { AppError } from "../../core/errors/app-error.js";
import { events } from "../../core/events/event-bus.js";

const createOrgSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
});

export async function organizationsModule(app: FastifyInstance) {
  // Create organization
  app.post("/organizations", async (request, reply) => {
    const authCtx = await resolveAuthContext(request);
    const body = createOrgSchema.parse(request.body);

    // Check slug uniqueness
    const existing = await prisma.organization.findUnique({
      where: { slug: body.slug },
    });
    if (existing) throw AppError.conflict("Slug já utilizado.");

    const org = await prisma.organization.create({
      data: {
        name: body.name,
        slug: body.slug,
        memberships: {
          create: {
            userId: authCtx.userId,
            role: "ORGANIZATION_OWNER",
          },
        },
      },
    });

    await events.organizationCreated(org.id, { name: org.name, slug: org.slug });

    return reply.status(201).send({
      data: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        status: org.status,
        createdAt: org.createdAt,
      },
    });
  });

  // Get organization
  app.get("/organizations/:organizationId", async (request) => {
    const authCtx = await resolveAuthContext(request);
    const { organizationId } = request.params as { organizationId: string };

    if (authCtx.organizationId !== organizationId) {
      throw AppError.forbidden();
    }

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        churches: true,
        memberships: {
          include: { user: { select: { id: true, name: true, primaryEmail: true } } },
        },
      },
    });

    if (!org) throw AppError.notFound();

    return {
      data: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        status: org.status,
        churches: org.churches.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          status: c.status,
        })),
        members: org.memberships.map((m) => ({
          userId: m.user.id,
          name: m.user.name,
          email: m.user.primaryEmail,
          role: m.role,
        })),
        createdAt: org.createdAt,
      },
    };
  });

  // List organization members
  app.get("/organizations/:organizationId/members", async (request) => {
    const authCtx = await resolveAuthContext(request);
    const { organizationId } = request.params as { organizationId: string };

    if (authCtx.organizationId !== organizationId) {
      throw AppError.forbidden();
    }

    const memberships = await prisma.organizationMembership.findMany({
      where: { organizationId },
      include: {
        user: {
          select: { id: true, name: true, primaryEmail: true, avatarUrl: true },
        },
      },
    });

    return {
      data: memberships.map((m) => ({
        userId: m.user.id,
        name: m.user.name,
        email: m.user.primaryEmail,
        avatarUrl: m.user.avatarUrl,
        role: m.role,
        joinedAt: m.createdAt,
      })),
    };
  });

  // Add member to organization
  app.post("/organizations/:organizationId/members", async (request) => {
    const authCtx = await resolveAuthContext(request);
    const { organizationId } = request.params as { organizationId: string };
    const body = request.body as { userId: string; role: string };

    if (authCtx.orgRole !== "ORGANIZATION_OWNER" && authCtx.orgRole !== "ORGANIZATION_ADMIN") {
      throw AppError.forbidden();
    }

    if (authCtx.organizationId !== organizationId) {
      throw AppError.forbidden();
    }

    const membership = await prisma.organizationMembership.create({
      data: {
        organizationId,
        userId: body.userId,
        role: body.role as "ORGANIZATION_OWNER" | "ORGANIZATION_ADMIN" | "BILLING_ADMIN" | "SUPPORT_ADMIN",
      },
      include: {
        user: { select: { id: true, name: true, primaryEmail: true } },
      },
    });

    return {
      data: {
        userId: membership.user.id,
        name: membership.user.name,
        email: membership.user.primaryEmail,
        role: membership.role,
      },
    };
  });
}
