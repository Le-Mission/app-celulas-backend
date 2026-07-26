import { createHmac, timingSafeEqual } from "node:crypto";
import { billingConfig } from "../../config/billing.js";
import type {
  PaymentGateway,
  CreateCheckoutParams,
  CheckoutResult,
  CreateSubscriptionParams,
  SubscriptionResult,
  CancelSubscriptionParams,
  WebhookEvent,
} from "./payment-gateway.js";
import { AppError } from "../../core/errors/app-error.js";

export class AbacatePayGateway implements PaymentGateway {
  constructor() {}

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    void params;
    // Will be implemented in ETAPA 7
    throw new AppError("NOT_IMPLEMENTED", "Checkout creation not yet implemented");
  }

  async createSubscription(params: CreateSubscriptionParams): Promise<SubscriptionResult> {
    void params;
    // Will be implemented in ETAPA 7
    throw new AppError("NOT_IMPLEMENTED", "Subscription creation not yet implemented");
  }

  async cancelSubscription(params: CancelSubscriptionParams): Promise<void> {
    void params;
    // Will be implemented in ETAPA 7
    throw new AppError("NOT_IMPLEMENTED", "Subscription cancellation not yet implemented");
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!billingConfig.webhookSecret) return false;

    const expectedSignature = createHmac("sha256", billingConfig.webhookSecret)
      .update(payload)
      .digest("hex");

    try {
      return timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      );
    } catch {
      return false;
    }
  }

  parseWebhookEvent(payload: string): WebhookEvent {
    const parsed = JSON.parse(payload) as WebhookEvent;
    return {
      id: parsed.id,
      event: parsed.event,
      apiVersion: parsed.apiVersion,
      devMode: parsed.devMode,
      data: parsed.data,
    };
  }
}
