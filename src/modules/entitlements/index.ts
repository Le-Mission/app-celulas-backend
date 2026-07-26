import type { FastifyInstance } from "fastify";
import { resolveAuthContext } from "../../core/tenancy/tenant-resolver.js";
import { AppError } from "../../core/errors/app-error.js";
import { entitlementService } from "../../core/entitlements/entitlement-service.js";

export async function entitlementsModule(app: FastifyInstance) {
  // Get entitlements for current organization
  app.get("/entitlements", async (request) => {
    const authCtx = await resolveAuthContext(request);
    if (!authCtx.organizationId) throw AppError.forbidden();

    const entitlements = await entitlementService.getEntitlements(authCtx.organizationId);

    return { data: entitlements };
  });

  // Check specific feature
  app.get("/entitlements/check/:featureKey", async (request) => {
    const authCtx = await resolveAuthContext(request);
    if (!authCtx.organizationId) throw AppError.forbidden();

    const { featureKey } = request.params as { featureKey: string };

    try {
      await entitlementService.assertFeature(authCtx.organizationId, featureKey);
      return { data: { available: true } };
    } catch {
      return { data: { available: false } };
    }
  });
}
