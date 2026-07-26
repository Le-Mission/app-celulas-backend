export interface CreateCheckoutParams {
  organizationId: string;
  planId: string;
  userId: string;
  returnUrl?: string;
  completionUrl?: string;
}

export interface CheckoutResult {
  checkoutId: string;
  url: string;
  externalCheckoutId: string;
}

export interface CreateSubscriptionParams {
  organizationId: string;
  planId: string;
  userId: string;
  returnUrl?: string;
  completionUrl?: string;
}

export interface SubscriptionResult {
  subscriptionId: string;
  url: string;
  externalSubscriptionId: string;
}

export interface CancelSubscriptionParams {
  externalSubscriptionId: string;
}

export interface WebhookEvent {
  id: string;
  event: string;
  apiVersion: number;
  devMode: boolean;
  data: Record<string, unknown>;
}

export interface PaymentGateway {
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult>;
  createSubscription(params: CreateSubscriptionParams): Promise<SubscriptionResult>;
  cancelSubscription(params: CancelSubscriptionParams): Promise<void>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
  parseWebhookEvent(payload: string): WebhookEvent;
}
