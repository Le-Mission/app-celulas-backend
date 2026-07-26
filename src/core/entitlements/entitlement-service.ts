import { prisma } from "../../config/database.js";
import { AppError } from "../errors/app-error.js";

export class EntitlementService {
  async assertFeature(organizationId: string, featureKey: string): Promise<void> {
    const subscription = await prisma.subscription.findFirst({
      where: {
        organizationId,
        status: { in: ["ACTIVE", "TRIALING"] },
      },
      include: {
        plan: {
          include: { features: true },
        },
      },
    });

    if (!subscription) {
      throw AppError.subscriptionRequired();
    }

    const feature = subscription.plan.features.find(
      (f: { featureKey: string }) => f.featureKey === featureKey,
    );

    if (!feature) {
      throw AppError.featureNotAvailable();
    }

    if (feature.valueType === "BOOLEAN" && feature.booleanValue === false) {
      throw AppError.featureNotAvailable();
    }
  }

  async assertLimit(
    organizationId: string,
    featureKey: string,
    currentUsage: number,
  ): Promise<void> {
    const subscription = await prisma.subscription.findFirst({
      where: {
        organizationId,
        status: { in: ["ACTIVE", "TRIALING"] },
      },
      include: {
        plan: {
          include: { features: true },
        },
      },
    });

    if (!subscription) {
      throw AppError.subscriptionRequired();
    }

    const feature = subscription.plan.features.find(
      (f: { featureKey: string }) => f.featureKey === featureKey,
    );

    if (!feature) {
      throw AppError.featureNotAvailable();
    }

    if (feature.limitType === "UNLIMITED") return;

    if (feature.limitType === "FIXED" && feature.numericValue !== null) {
      const limit = Number(feature.numericValue);
      if (limit >= 0 && currentUsage >= limit) {
        throw AppError.planLimitReached();
      }
    }
  }

  async getEntitlements(organizationId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        organizationId,
        status: { in: ["ACTIVE", "TRIALING"] },
      },
      include: {
        plan: {
          include: { features: true },
        },
      },
    });

    if (!subscription) {
      return { plan: null, features: [] };
    }

    return {
      plan: {
        code: subscription.plan.code,
        name: subscription.plan.name,
        status: subscription.plan.status,
        billingInterval: subscription.plan.billingInterval,
        priceInCents: subscription.plan.priceInCents,
      },
      features: subscription.plan.features.map((f: { featureKey: string; valueType: string; limitType: string | null; booleanValue: boolean | null; numericValue: bigint | null; textValue: string | null }) => ({
        key: f.featureKey,
        valueType: f.valueType,
        limitType: f.limitType,
        booleanValue: f.booleanValue,
        numericValue: f.numericValue ? Number(f.numericValue) : null,
        textValue: f.textValue,
      })),
    };
  }
}

export const entitlementService = new EntitlementService();
