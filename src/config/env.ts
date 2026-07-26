import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("0.0.0.0"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
  API_BASE_URL: z.string().url().default("http://localhost:3000"),
  CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),

  // Database
  DATABASE_URL: z.string(),
  DIRECT_DATABASE_URL: z.string(),

  // Clerk
  CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  CLERK_JWT_AUDIENCE: z.string().optional(),

  // Wasabi
  WASABI_ENDPOINT: z.string().url().default("https://s3.wasabisys.com"),
  WASABI_REGION: z.string().default("us-east-1"),
  WASABI_ACCESS_KEY_ID: z.string(),
  WASABI_SECRET_ACCESS_KEY: z.string(),
  WASABI_BUCKET: z.string(),

  // AbacatePay
  ABACATEPAY_API_URL: z.string().url().default("https://api.abacatepay.com/v2"),
  ABACATEPAY_API_KEY: z.string(),
  ABACATEPAY_WEBHOOK_SECRET: z.string().optional(),
  ABACATEPAY_ENVIRONMENT: z.enum(["development", "production"]).default("development"),

  // Billing
  BILLING_GRACE_PERIOD_DAYS: z.coerce.number().default(7),
  DEFAULT_CURRENCY: z.string().default("BRL"),
  DEFAULT_TIMEZONE: z.string().default("America/Sao_Paulo"),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  return parsed.data;
}

export const env = loadEnv();
export type Env = z.infer<typeof envSchema>;
