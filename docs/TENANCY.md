# Multi-Tenancy

## Model

```
Organization (SaaS Tenant)
├── Billing + Subscription
├── Users (OrganizationMemberships)
└── Churches (Operational Units)
    ├── Cells
    ├── Members (ChurchMemberships)
    └── Events
```

## Resolution

1. Authenticate user via Clerk JWT
2. Find internal User by `clerkUserId`
3. Find OrganizationMembership for user
4. Resolve `organizationId`
5. Optionally resolve `churchId` via ChurchMembership

## Rules

- `organizationId` is **never** sent by the client
- `organizationId` is resolved from auth context
- Every database query is scoped to `organizationId`
- Cross-tenant access returns 403

## Church Scoping

Some entities have both `organizationId` and `churchId`:
- Cells
- Files
- Audit logs

When `churchId` is present, queries should filter by both.

## Future: Multi-Church Organizations

The model supports:
- One Organization with many Churches
- One user with memberships in multiple Churches
- One user as OWNER of one Organization

This enables denomination-level SaaS deployment.
