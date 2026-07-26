import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { prisma } from "../../config/database.js";
import { resolveAuthContext } from "../../core/tenancy/tenant-resolver.js";
import { AppError } from "../../core/errors/app-error.js";
import { entitlementService } from "../../core/entitlements/entitlement-service.js";

export async function filesModule(app: FastifyInstance) {
  // Presign upload URL
  app.post("/files/presign-upload", async (request) => {
    const authCtx = await resolveAuthContext(request);
    const body = request.body as {
      filename: string;
      contentType: string;
      contentLength: number;
      entityType: string;
      entityId?: string;
      churchId?: string;
    };

    if (!authCtx.permissions.includes("files.upload")) throw AppError.forbidden();

    // Check storage entitlement
    const orgId = authCtx.organizationId;
    if (!orgId) throw AppError.forbidden();

    // Get current storage usage
    const usage = await prisma.usageCounter.findUnique({
      where: {
        organizationId_metricKey: {
          organizationId: orgId,
          metricKey: "storage.bytes",
        },
      },
    });

    const currentUsage = usage ? Number(usage.value) : 0;
    await entitlementService.assertLimit(orgId, "storage.bytes", currentUsage);

    // Generate storage key
    const fileUuid = randomUUID();
    const storageKey = [
      "organizations",
      orgId,
      body.churchId ? `churches/${body.churchId}` : "",
      body.entityType,
      body.entityId ?? "general",
      `${fileUuid}-${body.filename}`,
    ]
      .filter(Boolean)
      .join("/");

    // Create file record (pending)
    const file = await prisma.fileObject.create({
      data: {
        organizationId: orgId,
        churchId: body.churchId,
        entityType: body.entityType,
        entityId: body.entityId,
        filename: body.filename,
        mimeType: body.contentType,
        sizeInBytes: BigInt(body.contentLength),
        storageKey,
        uploadedByUserId: authCtx.userId,
      },
    });

    // In production, generate presigned URL from Wasabi
    // For now, return placeholder
    const uploadUrl = `https://wasabi-upload-placeholder/${storageKey}`;

    return {
      data: {
        fileId: file.id,
        uploadUrl,
        storageKey,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      },
    };
  });

  // Complete upload (update storage usage)
  app.post("/files/complete", async (request) => {
    const authCtx = await resolveAuthContext(request);
    const body = request.body as { fileId: string };

    const file = await prisma.fileObject.findUnique({ where: { id: body.fileId } });
    if (!file) throw AppError.notFound();
    if (file.uploadedByUserId !== authCtx.userId) throw AppError.forbidden();

    // Update storage usage
    await prisma.usageCounter.upsert({
      where: {
        organizationId_metricKey: {
          organizationId: file.organizationId,
          metricKey: "storage.bytes",
        },
      },
      update: {
        value: { increment: file.sizeInBytes },
      },
      create: {
        organizationId: file.organizationId,
        metricKey: "storage.bytes",
        value: file.sizeInBytes,
      },
    });

    return { data: { fileId: file.id, status: "completed" } };
  });

  // Get download URL
  app.get("/files/:fileId/download-url", async (request) => {
    const authCtx = await resolveAuthContext(request);
    const { fileId } = request.params as { fileId: string };

    if (!authCtx.permissions.includes("files.read")) throw AppError.forbidden();

    const file = await prisma.fileObject.findUnique({ where: { id: fileId } });
    if (!file) throw AppError.notFound();
    if (file.organizationId !== authCtx.organizationId) throw AppError.forbidden();

    // In production, generate presigned download URL from Wasabi
    const downloadUrl = `https://wasabi-download-placeholder/${file.storageKey}`;

    return {
      data: {
        fileId: file.id,
        filename: file.filename,
        mimeType: file.mimeType,
        downloadUrl,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      },
    };
  });

  // Delete file
  app.delete("/files/:fileId", async (request) => {
    const authCtx = await resolveAuthContext(request);
    const { fileId } = request.params as { fileId: string };

    if (!authCtx.permissions.includes("files.delete")) throw AppError.forbidden();

    const file = await prisma.fileObject.findUnique({ where: { id: fileId } });
    if (!file) throw AppError.notFound();
    if (file.organizationId !== authCtx.organizationId) throw AppError.forbidden();

    // Update storage usage
    await prisma.usageCounter.upsert({
      where: {
        organizationId_metricKey: {
          organizationId: file.organizationId,
          metricKey: "storage.bytes",
        },
      },
      update: {
        value: { decrement: file.sizeInBytes },
      },
      create: {
        organizationId: file.organizationId,
        metricKey: "storage.bytes",
        value: BigInt(0),
      },
    });

    await prisma.fileObject.delete({ where: { id: fileId } });

    return { data: { deleted: true } };
  });
}
