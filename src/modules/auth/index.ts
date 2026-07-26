import type { FastifyInstance } from "fastify";
import { getAuth } from "@clerk/fastify";
import { prisma } from "../../config/database.js";
import { AppError } from "../../core/errors/app-error.js";
import { events } from "../../core/events/event-bus.js";

export async function authModule(app: FastifyInstance) {
  // Bootstrap endpoint — creates/updates internal user from Clerk
  app.post("/auth/bootstrap", async (request, reply) => {
    const auth = getAuth(request);
    if (!auth?.userId) {
      throw AppError.unauthenticated();
    }

    const clerkUserId = auth.userId;

    // Get Clerk user data
    const clerkUser = await import("@clerk/fastify").then((m) =>
      m.clerkClient.users.getUser(clerkUserId),
    );

    const primaryEmail =
      clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
        ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) {
      throw AppError.validationError("Email não encontrado no Clerk.");
    }

    // Upsert internal user
    const user = await prisma.user.upsert({
      where: { clerkUserId },
      update: {
        primaryEmail,
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || primaryEmail,
        avatarUrl: clerkUser.imageUrl,
        lastLoginAt: new Date(),
      },
      create: {
        clerkUserId,
        primaryEmail,
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || primaryEmail,
        avatarUrl: clerkUser.imageUrl,
        lastLoginAt: new Date(),
      },
    });

    // Get memberships
    const orgMemberships = await prisma.organizationMembership.findMany({
      where: { userId: user.id },
      include: {
        organization: {
          include: {
            churches: true,
          },
        },
      },
    });

    // Get subscriptions
    const subscriptions = orgMemberships.length > 0
      ? await prisma.subscription.findMany({
          where: {
            organizationId: { in: orgMemberships.map((m) => m.organizationId) },
            status: { in: ["ACTIVE", "TRIALING"] },
          },
          include: { plan: true },
        })
      : [];

    // Emit event
    await events.userBootstrapped(user.id, {
      clerkUserId,
      email: primaryEmail,
      orgCount: orgMemberships.length,
    });

    return reply.status(200).send({
      data: {
        user: {
          id: user.id,
          clerkUserId: user.clerkUserId,
          email: user.primaryEmail,
          name: user.name,
          avatarUrl: user.avatarUrl,
          status: user.status,
        },
        memberships: orgMemberships.map((m) => ({
          organizationId: m.organizationId,
          organizationName: m.organization.name,
          role: m.role,
          churches: m.organization.churches.map((c) => ({
            id: c.id,
            name: c.name,
          })),
        })),
        subscriptions: subscriptions.map((s) => ({
          organizationId: s.organizationId,
          planCode: s.plan.code,
          planName: s.plan.name,
          status: s.status,
        })),
      },
    });
  });

  // Clerk webhook — receives user events
  app.post("/webhooks/clerk", async (request, reply) => {
    const body = request.body as { type?: string; data?: { id?: string } };

    if (!body?.type || !body?.data?.id) {
      throw AppError.validationError("Invalid webhook payload");
    }

    const { type, data } = body;

    switch (type) {
      case "user.created":
      case "user.updated": {
        const clerkUser = await import("@clerk/fastify").then((m) =>
          m.clerkClient.users.getUser(data.id!),
        );

        const primaryEmail =
          clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
            ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

        if (primaryEmail) {
          await prisma.user.upsert({
            where: { clerkUserId: data.id! },
            update: {
              primaryEmail,
              name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || primaryEmail,
              avatarUrl: clerkUser.imageUrl,
            },
            create: {
              clerkUserId: data.id!,
              primaryEmail,
              name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || primaryEmail,
              avatarUrl: clerkUser.imageUrl,
            },
          });
        }
        break;
      }
      case "user.deleted": {
        await prisma.user.updateMany({
          where: { clerkUserId: data.id! },
          data: { status: "INACTIVE" },
        });
        break;
      }
    }

    return reply.status(200).send({ received: true });
  });
}
