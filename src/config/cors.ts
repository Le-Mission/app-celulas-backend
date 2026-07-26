import { env } from "./env.js";

export const corsConfig = {
  origin: env.CORS_ALLOWED_ORIGINS.split(",").map((o) => o.trim()),
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
  credentials: true,
  maxAge: 86400,
};
