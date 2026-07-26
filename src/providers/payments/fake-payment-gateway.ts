import type {
  PaymentGateway,
  CreateCheckoutParams,
  CheckoutResult,
  CreateSubscriptionParams,
  SubscriptionResult,
  CancelSubscriptionParams,
  WebhookEvent,
} from "./payment-gateway.js";

export class FakePaymentGateway implements PaymentGateway {
  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    return {
      checkoutId: `fake_checkout_${Date.now()}`,
      url: `https://fake-checkout.example.com/${params.planId}`,
      externalCheckoutId: `ext_fake_${Date.now()}`,
    };
  }

  async createSubscription(params: CreateSubscriptionParams): Promise<SubscriptionResult> {
    return {
      subscriptionId: `fake_sub_${Date.now()}`,
      url: `https://fake-checkout.example.com/sub/${params.planId}`,
      externalSubscriptionId: `ext_fake_sub_${Date.now()}`,
    };
  }

  async cancelSubscription(_params: CancelSubscriptionParams): Promise<void> {
    // No-op for fake
  }

  verifyWebhookSignature(_payload: string, _signature: string): boolean {
    return true;
  }

  parseWebhookEvent(payload: string): WebhookEvent {
    return JSON.parse(payload) as WebhookEvent;
  }
}
