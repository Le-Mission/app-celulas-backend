import { vi, afterEach } from "vitest";

// Global test setup
afterEach(() => {
  vi.restoreAllMocks();
});
