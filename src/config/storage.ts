import { env } from "./env.js";

export const storageConfig = {
  endpoint: env.WASABI_ENDPOINT,
  region: env.WASABI_REGION,
  accessKeyId: env.WASABI_ACCESS_KEY_ID,
  secretAccessKey: env.WASABI_SECRET_ACCESS_KEY,
  bucket: env.WASABI_BUCKET,
};
