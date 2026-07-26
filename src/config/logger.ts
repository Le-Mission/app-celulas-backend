import pino from "pino";
import { env } from "./env.js";

export const logger = pino({
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
  serializers: {
    req(request) {
      return {
        method: request.method,
        url: request.url,
        hostname: request.hostname,
        remoteAddress: request.ip,
      };
    },
    res(reply) {
      return {
        statusCode: reply.statusCode,
      };
    },
  },
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "CLERK_SECRET_KEY",
    "CLERK_WEBHOOK_SECRET",
    "ABACATEPAY_API_KEY",
    "ABACATEPAY_WEBHOOK_SECRET",
    "WASABI_ACCESS_KEY_ID",
    "WASABI_SECRET_ACCESS_KEY",
    "DATABASE_URL",
    "DIRECT_DATABASE_URL",
  ],
});
