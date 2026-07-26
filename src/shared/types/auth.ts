export interface AuthContext {
  userId: string;
  clerkUserId: string;
  email: string;
  name: string;
  organizationId?: string;
  churchId?: string;
  cellId?: string;
  orgRole?: string;
  churchRole?: string;
  cellRole?: string;
  permissions: string[];
}

export interface RequestContext {
  requestId: string;
  ip?: string;
  userAgent?: string;
  auth?: AuthContext;
}
