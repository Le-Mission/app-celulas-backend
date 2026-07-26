import { PrismaClient } from "@prisma/client";
import { logger } from "./logger.js";

export const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "stdout", level: "error" },
    { emit: "stdout", level: "warn" },
  ],
});

prisma.$on("query", (e) => {
  if (process.env.NODE_ENV === "development") {
    logger.debug({ query: e.query, duration: e.duration }, "Prisma query");
  }
});
