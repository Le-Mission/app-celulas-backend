import { env } from "./env.js";

export const billingConfig = {
  apiUrl: env.ABACATEPAY_API_URL,
  apiKey: env.ABACATEPAY_API_KEY,
  webhookSecret: env.ABACATEPAY_WEBHOOK_SECRET,
  environment: env.ABACATEPAY_ENVIRONMENT,
  gracePeriodDays: env.BILLING_GRACE_PERIOD_DAYS,
  defaultCurrency: env.DEFAULT_CURRENCY,
  defaultTimezone: env.DEFAULT_TIMEZONE,
};
