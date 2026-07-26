import type { FastifyInstance } from "fastify";
import { prisma } from "../../config/database.js";
import { AppError } from "../../core/errors/app-error.js";

export async function plansModule(app: FastifyInstance) {
  // List public plans
  app.get("/plans", async () => {
    const plans = await prisma.plan.findMany({
      where: { isPublic: true, status: "ACTIVE" },
      include: { features: true },
      orderBy: { priceInCents: "asc" },
    });

    return {
      data: plans.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        description: p.description,
        billingInterval: p.billingInterval,
        priceInCents: p.priceInCents,
        currency: p.currency,
        trialDays: p.trialDays,
        features: p.features.map((f) => ({
          key: f.featureKey,
          valueType: f.valueType,
          limitType: f.limitType,
          booleanValue: f.booleanValue,
          numericValue: f.numericValue ? Number(f.numericValue) : null,
          textValue: f.textValue,
        })),
      })),
    };
  });

  // Get plan by code
  app.get("/plans/:planCode", async (request) => {
    const { planCode } = request.params as { planCode: string };

    const plan = await prisma.plan.findUnique({
      where: { code: planCode as "SOLO" | "LOCAL" | "INSTITUTIONAL" },
      include: { features: true },
    });

    if (!plan) throw AppError.notFound();

    return {
      data: {
        id: plan.id,
        code: plan.code,
        name: plan.name,
        description: plan.description,
        billingInterval: plan.billingInterval,
        priceInCents: plan.priceInCents,
        currency: plan.currency,
        trialDays: plan.trialDays,
        features: plan.features.map((f) => ({
          key: f.featureKey,
          valueType: f.valueType,
          limitType: f.limitType,
          booleanValue: f.booleanValue,
          numericValue: f.numericValue ? Number(f.numericValue) : null,
          textValue: f.textValue,
        })),
      },
    };
  });
}
