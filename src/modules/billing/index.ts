import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { prisma } from "../../config/database.js";
import { resolveAuthContext } from "../../core/tenancy/tenant-resolver.js";
import { AppError } from "../../core/errors/app-error.js";
import { AbacatePayGateway } from "../../providers/payments/abacatepay-gateway.js";
import { events } from "../../core/events/event-bus.js";
import { createHmac } from "node:crypto";
import { billingConfig } from "../../config/billing.js";

const gateway = new AbacatePayGateway();

export async function billingModule(app: FastifyInstance) {
  // Create checkout
  app.post("/billing/checkout", async (request, reply) => {
    const authCtx = await resolveAuthContext(request);
    if (!authCtx.organizationId) throw AppError.forbidden();
    if (!authCtx.permissions.includes("billing.manage")) throw AppError.forbidden();

    const body = request.body as { planCode: string };

    // Load plan from database
    const plan = await prisma.plan.findUnique({
      where: { code: body.planCode as "SOLO" | "LOCAL" | "INSTITUTIONAL" },
    });
    if (!plan || plan.status !== "ACTIVE") throw AppError.notFound("Plano não encontrado ou inativo.");
    if (!plan.priceInCents) throw AppError.validationError("Plano sem preço definido.");

    // Check for existing active subscription
    const existingSub = await prisma.subscription.findFirst({
      where: {
        organizationId: authCtx.organizationId,
        status: { in: ["ACTIVE", "TRIALING", "INCOMPLETE"] },
      },
    });
    if (existingSub) throw AppError.conflict("Já existe uma assinatura ativa.");

    // Ensure billing account exists
    let billingAccount = await prisma.billingAccount.findUnique({
      where: { organizationId: authCtx.organizationId },
    });

    if (!billingAccount) {
      billingAccount = await prisma.billingAccount.create({
        data: {
          organizationId: authCtx.organizationId,
          billingEmail: authCtx.email,
          status: "active",
        },
      });
    }

    // Create checkout session record
    const checkoutSession = await prisma.checkoutSession.create({
      data: {
        organizationId: authCtx.organizationId,
        planId: plan.id,
        provider: "abacatepay",
        externalCheckoutId: `pending_${randomUUID()}`,
        externalUrl: "",
        status: "PENDING",
        createdByUserId: authCtx.userId,
      },
    });

    // Create AbacatePay checkout (stub for now)
    try {
      const result = await gateway.createCheckout({
        organizationId: authCtx.organizationId,
        planId: plan.id,
        userId: authCtx.userId,
      });

      await prisma.checkoutSession.update({
        where: { id: checkoutSession.id },
        data: {
          externalCheckoutId: result.externalCheckoutId,
          externalUrl: result.url,
        },
      });

      await events.subscriptionCheckoutCreated(checkoutSession.id, {
        organizationId: authCtx.organizationId,
        planCode: plan.code,
        amountInCents: plan.priceInCents,
      });

      return reply.status(201).send({
        data: {
          checkoutId: checkoutSession.id,
          url: result.url,
          planCode: plan.code,
          amountInCents: plan.priceInCents,
        },
      });
    } catch {
      await prisma.checkoutSession.update({
        where: { id: checkoutSession.id },
        data: { status: "CANCELED" },
      });
      throw AppError.paymentProviderError("Erro ao criar checkout.");
    }
  });

  // Cancel subscription
  app.post("/billing/subscription/cancel", async (request) => {
    const authCtx = await resolveAuthContext(request);
    if (!authCtx.organizationId) throw AppError.forbidden();
    if (!authCtx.permissions.includes("billing.manage")) throw AppError.forbidden();

    const subscription = await prisma.subscription.findFirst({
      where: {
        organizationId: authCtx.organizationId,
        status: { in: ["ACTIVE", "TRIALING"] },
      },
    });

    if (!subscription) throw AppError.notFound("Assinatura ativa não encontrada.");

    await gateway.cancelSubscription({
      externalSubscriptionId: subscription.externalSubscriptionId ?? "",
    });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "CANCELED",
        canceledAt: new Date(),
        cancelAtPeriodEnd: false,
      },
    });

    await events.subscriptionCancelled(subscription.id, {
      organizationId: authCtx.organizationId,
    });

    return { data: { status: "canceled" } };
  });

  // Resume subscription
  app.post("/billing/subscription/resume", async (request) => {
    const authCtx = await resolveAuthContext(request);
    if (!authCtx.organizationId) throw AppError.forbidden();
    if (!authCtx.permissions.includes("billing.manage")) throw AppError.forbidden();

    const subscription = await prisma.subscription.findFirst({
      where: {
        organizationId: authCtx.organizationId,
        status: "CANCELED",
        cancelAtPeriodEnd: true,
      },
    });

    if (!subscription) throw AppError.notFound("Assinatura cancelada não encontrada.");

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
    });

    return { data: { status: "resumed" } };
  });

  // List payments
  app.get("/billing/payments", async (request) => {
    const authCtx = await resolveAuthContext(request);
    if (!authCtx.organizationId) throw AppError.forbidden();
    if (!authCtx.permissions.includes("billing.read")) throw AppError.forbidden();

    const payments = await prisma.saaSPayment.findMany({
      where: { organizationId: authCtx.organizationId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return {
      data: payments.map((p) => ({
        id: p.id,
        amountInCents: p.amountInCents,
        paidAmountInCents: p.paidAmountInCents,
        currency: p.currency,
        method: p.method,
        status: p.status,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
    };
  });

  // Get payment by ID
  app.get("/billing/payments/:paymentId", async (request) => {
    const authCtx = await resolveAuthContext(request);
    const { paymentId } = request.params as { paymentId: string };
    if (!authCtx.organizationId) throw AppError.forbidden();

    const payment = await prisma.saaSPayment.findFirst({
      where: { id: paymentId, organizationId: authCtx.organizationId },
    });

    if (!payment) throw AppError.notFound();

    return {
      data: {
        id: payment.id,
        amountInCents: payment.amountInCents,
        paidAmountInCents: payment.paidAmountInCents,
        platformFeeInCents: payment.platformFeeInCents,
        currency: payment.currency,
        method: payment.method,
        status: payment.status,
        paidAt: payment.paidAt,
        refundedAt: payment.refundedAt,
        disputedAt: payment.disputedAt,
        createdAt: payment.createdAt,
      },
    };
  });

  // AbacatePay webhook
  app.post("/webhooks/abacatepay", async (request, reply) => {
    const rawBody = JSON.stringify(request.body);
    const signature = (request.headers["x-webhook-signature"] as string) ?? "";

    // Verify signature
    if (billingConfig.webhookSecret) {
      const expectedSignature = createHmac("sha256", billingConfig.webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (signature !== expectedSignature) {
        throw AppError.webhookSignatureInvalid();
      }
    }

    const event = request.body as { id?: string; event?: string; data?: Record<string, unknown> };

    if (!event?.id || !event?.event) {
      throw AppError.validationError("Webhook payload inválido.");
    }

    // Idempotency check
    const existing = await prisma.webhookEvent.findUnique({
      where: {
        provider_externalEventId: {
          provider: "abacatepay",
          externalEventId: event.id,
        },
      },
    });

    if (existing?.status === "PROCESSED") {
      return reply.status(200).send({ received: true, status: "already_processed" });
    }

    // Record event
    await prisma.webhookEvent.upsert({
      where: {
        provider_externalEventId: {
          provider: "abacatepay",
          externalEventId: event.id,
        },
      },
      update: { attempts: { increment: 1 } },
      create: {
        provider: "abacatepay",
        externalEventId: event.id,
        eventType: event.event,
        apiVersion: String((event as Record<string, unknown>).apiVersion ?? ""),
        environment: billingConfig.environment,
        payloadJson: rawBody,
        status: "PROCESSING",
      },
    });

    // Process event
    try {
      switch (event.event) {
        case "checkout.completed": {
          const data = event.data as { checkout?: { id?: string; externalId?: string } };
          if (data.checkout?.externalId) {
            await prisma.checkoutSession.updateMany({
              where: { externalCheckoutId: data.checkout.id },
              data: { status: "COMPLETED" },
            });
          }
          break;
        }
        case "subscription.completed": {
          const data = event.data as { subscription?: { id?: string } };
          if (data.subscription?.id) {
            await prisma.subscription.updateMany({
              where: { externalSubscriptionId: data.subscription.id },
              data: { status: "ACTIVE", currentPeriodStart: new Date() },
            });
          }
          break;
        }
        case "subscription.renewed": {
          const data = event.data as { subscription?: { id?: string } };
          if (data.subscription?.id) {
            const sub = await prisma.subscription.findFirst({
              where: { externalSubscriptionId: data.subscription.id },
            });
            if (sub) {
              await events.paymentCompleted(sub.id, {
                externalSubscriptionId: data.subscription.id,
                organizationId: sub.organizationId,
              });
            }
          }
          break;
        }
        case "subscription.cancelled": {
          const data = event.data as { subscription?: { id?: string } };
          if (data.subscription?.id) {
            await prisma.subscription.updateMany({
              where: { externalSubscriptionId: data.subscription.id },
              data: { status: "CANCELED", canceledAt: new Date() },
            });
          }
          break;
        }
      }

      // Mark as processed
      await prisma.webhookEvent.updateMany({
        where: {
          provider: "abacatepay",
          externalEventId: event.id,
        },
        data: { status: "PROCESSED", processedAt: new Date() },
      });
    } catch (err) {
      await prisma.webhookEvent.updateMany({
        where: {
          provider: "abacatepay",
          externalEventId: event.id,
        },
        data: {
          status: "FAILED",
          failureReason: err instanceof Error ? err.message : "Unknown error",
        },
      });
      throw AppError.internal("Erro ao processar webhook.");
    }

    return reply.status(200).send({ received: true });
  });
}
