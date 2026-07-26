import type { FastifyInstance } from "fastify";
import { prisma } from "../../config/database.js";
import { resolveAuthContext } from "../../core/tenancy/tenant-resolver.js";
import { AppError } from "../../core/errors/app-error.js";

export async function subscriptionsModule(app: FastifyInstance) {
  // Get current subscription
  app.get("/billing/subscription", async (request) => {
    const authCtx = await resolveAuthContext(request);
    if (!authCtx.organizationId) throw AppError.forbidden();

    const subscription = await prisma.subscription.findFirst({
      where: {
        organizationId: authCtx.organizationId,
        status: { notIn: ["CANCELED", "EXPIRED"] },
      },
      include: {
        plan: true,
        billingAccount: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      return { data: null };
    }

    return {
      data: {
        id: subscription.id,
        status: subscription.status,
        plan: {
          code: subscription.plan.code,
          name: subscription.plan.name,
          priceInCents: subscription.plan.priceInCents,
          billingInterval: subscription.plan.billingInterval,
        },
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        trialEndsAt: subscription.trialEndsAt,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        createdAt: subscription.createdAt,
      },
    };
  });

  // Get billing usage
  app.get("/billing/usage", async (request) => {
    const authCtx = await resolveAuthContext(request);
    if (!authCtx.organizationId) throw AppError.forbidden();

    const counters = await prisma.usageCounter.findMany({
      where: { organizationId: authCtx.organizationId },
    });

    return {
      data: counters.map((c) => ({
        metricKey: c.metricKey,
        value: Number(c.value),
        periodStart: c.periodStart,
        periodEnd: c.periodEnd,
      })),
    };
  });

  // Get entitlements
  app.get("/billing/entitlements", async (request) => {
    const authCtx = await resolveAuthContext(request);
    if (!authCtx.organizationId) throw AppError.forbidden();

    const { entitlementService } = await import("../../core/entitlements/entitlement-service.js");
    const entitlements = await entitlementService.getEntitlements(authCtx.organizationId);

    return { data: entitlements };
  });
}
