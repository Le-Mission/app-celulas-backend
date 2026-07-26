import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

async function main() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    logger.info(`🚀 Le Mission API running on http://${env.HOST}:${env.PORT}`);
    logger.info(`📚 Swagger docs at http://${env.HOST}:${env.PORT}/docs`);
  } catch (err) {
    logger.error(err, "Failed to start server");
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down...`);
    await app.close();
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main();
