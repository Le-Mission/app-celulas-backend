import Fastify from "fastify";
import { logger } from "./config/logger.js";
import { errorHandler } from "./plugins/error-handler.js";
import { requestContextPlugin } from "./plugins/request-context.js";
import { securityPlugin } from "./plugins/security.js";
import { swaggerPlugin } from "./plugins/swagger.js";
import { authPlugin } from "./plugins/auth.js";
import { healthModule } from "./modules/health/index.js";
import { authModule } from "./modules/auth/index.js";
import { usersModule } from "./modules/users/index.js";
import { organizationsModule } from "./modules/organizations/index.js";
import { churchesModule } from "./modules/churches/index.js";
import { membershipsModule } from "./modules/memberships/index.js";
import { rolesModule } from "./modules/roles/index.js";
import { cellsModule } from "./modules/cells/index.js";
import { filesModule } from "./modules/files/index.js";
import { auditModule } from "./modules/audit/index.js";
import { plansModule } from "./modules/plans/index.js";
import { subscriptionsModule } from "./modules/subscriptions/index.js";
import { billingModule } from "./modules/billing/index.js";
import { entitlementsModule } from "./modules/entitlements/index.js";

export async function buildApp() {
  const app = Fastify({
    logger,
    requestIdHeader: "x-request-id",
    genReqId: () => crypto.randomUUID(),
    bodyLimit: 10 * 1024 * 1024, // 10MB
  });

  // Core plugins
  await app.register(requestContextPlugin);
  await app.register(securityPlugin);
  await app.register(swaggerPlugin);

  // Clerk auth plugin
  await app.register(authPlugin);

  // Error handler
  app.setErrorHandler(errorHandler);

  // Health endpoints (unauthenticated)
  await app.register(healthModule);

  // Auth webhook (no Clerk auth required — signature verified)
  await app.register(authModule);

  // API routes (authenticated)
  await app.register(async (api) => {
    await api.register(usersModule);
    await api.register(organizationsModule);
    await api.register(churchesModule);
    await api.register(membershipsModule);
    await api.register(rolesModule);
    await api.register(cellsModule);
    await api.register(filesModule);
    await api.register(auditModule);
    await api.register(plansModule);
    await api.register(subscriptionsModule);
    await api.register(billingModule);
    await api.register(entitlementsModule);
  }, { prefix: "/api/v1" });

  return app;
}
