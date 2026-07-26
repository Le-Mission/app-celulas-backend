import { describe, it, expect } from "vitest";
import { FakePaymentGateway } from "../../src/providers/payments/fake-payment-gateway.js";

describe("FakePaymentGateway", () => {
  const gateway = new FakePaymentGateway();

  it("creates a checkout", async () => {
    const result = await gateway.createCheckout({
      organizationId: "org-123",
      planId: "plan-456",
      userId: "user-789",
    });

    expect(result.checkoutId).toContain("fake_checkout_");
    expect(result.url).toContain("fake-checkout");
    expect(result.externalCheckoutId).toContain("ext_fake_");
  });

  it("creates a subscription", async () => {
    const result = await gateway.createSubscription({
      organizationId: "org-123",
      planId: "plan-456",
      userId: "user-789",
    });

    expect(result.subscriptionId).toContain("fake_sub_");
    expect(result.url).toContain("fake-checkout");
  });

  it("cancels a subscription", async () => {
    await expect(
      gateway.cancelSubscription({ externalSubscriptionId: "ext-123" }),
    ).resolves.toBeUndefined();
  });

  it("verifies webhook signature", () => {
    expect(gateway.verifyWebhookSignature("payload", "sig")).toBe(true);
  });

  it("parses webhook event", () => {
    const event = gateway.parseWebhookEvent(
      JSON.stringify({
        id: "evt-123",
        event: "checkout.completed",
        apiVersion: 2,
        devMode: false,
        data: {},
      }),
    );

    expect(event.id).toBe("evt-123");
    expect(event.event).toBe("checkout.completed");
  });
});
