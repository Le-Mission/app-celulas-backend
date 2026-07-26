import type { FastifyError } from "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../core/errors/app-error.js";
import { ZodError } from "zod";

export async function errorHandler(
  error: FastifyError | AppError | ZodError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const requestId = request.id ?? "unknown";

  // AppError (our custom errors)
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
        details: error.details ?? {},
        requestId,
      },
    });
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: {
        code: "VALIDATION_ERROR",
        message: "Dados inválidos.",
        details: error.flatten().fieldErrors,
        requestId,
      },
    });
  }

  // Fastify HTTP errors
  if ("statusCode" in error && typeof error.statusCode === "number") {
    const statusCode = error.statusCode;

    // Rate limit
    if (statusCode === 429) {
      return reply.status(429).send({
        error: {
          code: "RATE_LIMITED",
          message: "Muitas requisições. Tente novamente mais tarde.",
          details: {},
          requestId,
        },
      });
    }

    return reply.status(statusCode).send({
      error: {
        code: "VALIDATION_ERROR",
        message: error.message,
        details: {},
        requestId,
      },
    });
  }

  // Unknown errors — never leak stack in production
  request.log.error({ err: error }, "Unhandled error");

  return reply.status(500).send({
    error: {
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor.",
      details: {},
      requestId,
    },
  });
}
