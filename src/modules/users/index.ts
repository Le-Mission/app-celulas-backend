import type { FastifyInstance } from "fastify";
import { prisma } from "../../config/database.js";
import { resolveAuthContext } from "../../core/tenancy/tenant-resolver.js";
import { AppError } from "../../core/errors/app-error.js";

export async function usersModule(app: FastifyInstance) {
  // Get current user profile
  app.get("/users/me", async (request) => {
    const authCtx = await resolveAuthContext(request);

    const user = await prisma.user.findUnique({
      where: { id: authCtx.userId },
    });

    if (!user) throw AppError.notFound();

    return {
      data: {
        id: user.id,
        email: user.primaryEmail,
        name: user.name,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        status: user.status,
        createdAt: user.createdAt,
      },
    };
  });

  // Update current user profile
  app.patch("/users/me", async (request) => {
    const authCtx = await resolveAuthContext(request);
    const body = request.body as { name?: string; phone?: string; avatarUrl?: string };

    const user = await prisma.user.update({
      where: { id: authCtx.userId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl }),
      },
    });

    return {
      data: {
        id: user.id,
        email: user.primaryEmail,
        name: user.name,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        status: user.status,
      },
    };
  });
}
