export interface DomainEvent {
  type: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  occurredAt: Date;
}

export type EventHandler = (event: DomainEvent) => Promise<void>;

class EventBus {
  private handlers = new Map<string, EventHandler[]>();

  on(type: string, handler: EventHandler) {
    const existing = this.handlers.get(type) ?? [];
    existing.push(handler);
    this.handlers.set(type, existing);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) ?? [];
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (err) {
        console.error(`Event handler error for ${event.type}:`, err);
      }
    }
  }
}

export const eventBus = new EventBus();

// Event creators
export const events = {
  userBootstrapped: (userId: string, data: Record<string, unknown>) => ({
    type: "UserBootstrapped",
    aggregateType: "User",
    aggregateId: userId,
    payload: data,
    occurredAt: new Date(),
  }),
  organizationCreated: (orgId: string, data: Record<string, unknown>) => ({
    type: "OrganizationCreated",
    aggregateType: "Organization",
    aggregateId: orgId,
    payload: data,
    occurredAt: new Date(),
  }),
  churchCreated: (churchId: string, data: Record<string, unknown>) => ({
    type: "ChurchCreated",
    aggregateType: "Church",
    aggregateId: churchId,
    payload: data,
    occurredAt: new Date(),
  }),
  subscriptionCheckoutCreated: (subId: string, data: Record<string, unknown>) => ({
    type: "SubscriptionCheckoutCreated",
    aggregateType: "Subscription",
    aggregateId: subId,
    payload: data,
    occurredAt: new Date(),
  }),
  subscriptionActivated: (subId: string, data: Record<string, unknown>) => ({
    type: "SubscriptionActivated",
    aggregateType: "Subscription",
    aggregateId: subId,
    payload: data,
    occurredAt: new Date(),
  }),
  subscriptionCancelled: (subId: string, data: Record<string, unknown>) => ({
    type: "SubscriptionCancelled",
    aggregateType: "Subscription",
    aggregateId: subId,
    payload: data,
    occurredAt: new Date(),
  }),
  paymentCompleted: (paymentId: string, data: Record<string, unknown>) => ({
    type: "PaymentCompleted",
    aggregateType: "SaaSPayment",
    aggregateId: paymentId,
    payload: data,
    occurredAt: new Date(),
  }),
  entitlementsChanged: (orgId: string, data: Record<string, unknown>) => ({
    type: "EntitlementsChanged",
    aggregateType: "Organization",
    aggregateId: orgId,
    payload: data,
    occurredAt: new Date(),
  }),
};
