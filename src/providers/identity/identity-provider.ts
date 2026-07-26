export interface IdentityProvider {
  verifyToken(token: string): Promise<IdentityResult>;
  getUser(clerkUserId: string): Promise<IdentityUser | null>;
}

export interface IdentityResult {
  clerkUserId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface IdentityUser {
  id: string;
  clerkUserId: string;
  email: string;
  name: string;
}
