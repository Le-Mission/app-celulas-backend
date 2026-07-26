import type { IdentityProvider, IdentityResult, IdentityUser } from "./identity-provider.js";

export class ClerkIdentityProvider implements IdentityProvider {
  async verifyToken(_token: string): Promise<IdentityResult> {
    // Clerk verification is handled by @clerk/fastify plugin
    // This is called after the plugin has verified the JWT
    throw new Error("Use @clerk/fastify plugin for token verification");
  }

  async getUser(clerkUserId: string): Promise<IdentityUser | null> {
    // This will be implemented with Clerk Backend API
    // For now, return null
    void clerkUserId;
    return null;
  }
}
