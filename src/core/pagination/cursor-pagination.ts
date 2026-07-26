import { z } from "zod";

export const paginationSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export function buildCursorWhere(cursor?: string) {
  if (!cursor) return {};
  return {
    createdAt: {
      gt: new Date(Buffer.from(cursor, "base64").toString("utf-8")),
    },
  };
}

export function encodeCursor(date: Date): string {
  return Buffer.from(date.toISOString()).toString("base64");
}

export function decodeCursor(cursor: string): Date {
  return new Date(Buffer.from(cursor, "base64").toString("utf-8"));
}
