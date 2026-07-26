import type { FastifyRequest } from "fastify";
import { prisma } from "../../config/database.js";
import { AppError } from "../errors/app-error.js";
import type { AuthContext } from "../../shared/types/auth.js";

export async function resolveAuthContext(request: FastifyRequest): Promise<AuthContext> {
  // @clerk/fastify attaches auth to request
  const auth = (request as unknown as { auth?: { userId?: string } }).auth;

  if (!auth?.userId) {
    throw AppError.unauthenticated();
  }

  const clerkUserId = auth.userId;

  // Find internal user
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    include: {
      orgMemberships: {
        include: { organization: true },
      },
    },
  });

  if (!user) {
    throw AppError.unauthenticated("Usuário não encontrado. Execute o bootstrap primeiro.");
  }

  if (user.status !== "ACTIVE") {
    throw AppError.forbidden("Conta desativada.");
  }

  // Get default org membership (first one for now)
  const orgMembership = user.orgMemberships[0];

  // Get church membership if applicable
  let churchId: string | undefined;
  let churchRole: string | undefined;

  if (orgMembership) {
    const churchMembership = await prisma.churchMembership.findFirst({
      where: {
        user: { id: user.id },
        church: { organizationId: orgMembership.organizationId },
      },
    });

    if (churchMembership) {
      churchId = churchMembership.churchId;
      churchRole = churchMembership.role;
    }
  }

  // Get permissions
  const permissions: string[] = [];

  if (orgMembership) {
    const rolePerms = await prisma.rolePermission.findMany({
      where: {
        role: {
          name: orgMembership.role,
          scope: "ORGANIZATION",
        },
      },
      include: { permission: true },
    });
    permissions.push(...rolePerms.map((rp) => rp.permission.key));
  }

  if (churchRole) {
    const churchPerms = await prisma.rolePermission.findMany({
      where: {
        role: {
          name: churchRole,
          scope: "CHURCH",
        },
      },
      include: { permission: true },
    });
    permissions.push(...churchPerms.map((rp) => rp.permission.key));
  }

  return {
    userId: user.id,
    clerkUserId,
    email: user.primaryEmail,
    name: user.name,
    organizationId: orgMembership?.organizationId,
    churchId,
    orgRole: orgMembership?.role,
    churchRole,
    permissions: [...new Set(permissions)],
  };
}

export function requirePermission(...requiredPermissions: string[]) {
  return async (request: FastifyRequest) => {
    const authCtx = await resolveAuthContext(request);

    for (const permission of requiredPermissions) {
      if (!authCtx.permissions.includes(permission)) {
        throw AppError.forbidden();
      }
    }

    // Attach auth context to request for downstream use
    (request as unknown as { authContext: AuthContext }).authContext = authCtx;
  };
}
