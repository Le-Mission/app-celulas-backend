import { describe, it, expect } from "vitest";
import { AppError } from "../../src/core/errors/app-error.js";

describe("AppError", () => {
  it("creates error with code and message", () => {
    const error = AppError.notFound("Test not found");
    expect(error.code).toBe("NOT_FOUND");
    expect(error.message).toBe("Test not found");
    expect(error.statusCode).toBe(404);
  });

  it("creates unauthenticated error", () => {
    const error = AppError.unauthenticated();
    expect(error.code).toBe("UNAUTHENTICATED");
    expect(error.statusCode).toBe(401);
  });

  it("creates forbidden error", () => {
    const error = AppError.forbidden();
    expect(error.code).toBe("FORBIDDEN");
    expect(error.statusCode).toBe(403);
  });

  it("creates validation error with details", () => {
    const error = AppError.validationError("Invalid data", { field: "email" });
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.statusCode).toBe(400);
    expect(error.details).toEqual({ field: "email" });
  });

  it("creates conflict error", () => {
    const error = AppError.conflict("Slug taken");
    expect(error.code).toBe("CONFLICT");
    expect(error.statusCode).toBe(409);
  });

  it("creates subscription required error", () => {
    const error = AppError.subscriptionRequired();
    expect(error.code).toBe("SUBSCRIPTION_REQUIRED");
    expect(error.statusCode).toBe(403);
  });

  it("creates plan limit reached error", () => {
    const error = AppError.planLimitReached();
    expect(error.code).toBe("PLAN_LIMIT_REACHED");
    expect(error.statusCode).toBe(403);
  });

  it("creates webhook already processed error", () => {
    const error = AppError.webhookAlreadyProcessed();
    expect(error.code).toBe("WEBHOOK_ALREADY_PROCESSED");
    expect(error.statusCode).toBe(200);
  });
});
