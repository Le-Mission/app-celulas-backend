import { describe, it, expect } from "vitest";
import { InMemoryCacheProvider } from "../../src/providers/cache/in-memory-cache.js";

describe("InMemoryCacheProvider", () => {
  const cache = new InMemoryCacheProvider();

  it("stores and retrieves values", async () => {
    await cache.set("key1", { name: "test" });
    const result = await cache.get<{ name: string }>("key1");
    expect(result).toEqual({ name: "test" });
  });

  it("returns null for missing keys", async () => {
    const result = await cache.get("nonexistent");
    expect(result).toBeNull();
  });

  it("deletes values", async () => {
    await cache.set("key2", "value");
    await cache.del("key2");
    const result = await cache.get("key2");
    expect(result).toBeNull();
  });

  it("checks existence", async () => {
    await cache.set("key3", "value");
    expect(await cache.has("key3")).toBe(true);
    expect(await cache.has("key4")).toBe(false);
  });
});
