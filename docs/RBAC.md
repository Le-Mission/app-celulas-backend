# RBAC (Role-Based Access Control)

## Organization Roles

| Role | Description |
|------|-------------|
| ORGANIZATION_OWNER | Full control over organization |
| ORGANIZATION_ADMIN | Most permissions except billing |
| BILLING_ADMIN | Billing and subscription management |
| SUPPORT_ADMIN | Read-only access for support |

## Church Roles

| Role | Description |
|------|-------------|
| CHURCH_ADMIN | Full control over church |
| PASTOR | Pastoral oversight, member management |
| LEADER | Cell leadership, limited editing |
| SECRETARY | Administrative tasks, member management |
| TREASURER | Financial access, reports |
| MEMBER | Basic read access |

## Cell Roles

| Role | Description |
|------|-------------|
| LEADER | Can edit cell, manage attendance |
| MEMBER | Read-only access to cell |

## Permission Keys

```
organization.read, organization.manage
billing.read, billing.manage
church.read, church.manage
cells.read, cells.create, cells.update, cells.delete
members.read, members.manage
meetings.read, meetings.manage
finance.read, finance.manage
files.upload, files.read, files.delete
reports.read, reports.advanced
audit.read
plans.read
```

## Contextual Authorization

Role alone is not sufficient. Context matters:

- LEADER can only edit cells they lead
- TREASURER can access finance but not billing
- BILLING_ADMIN can manage subscriptions but not pastoral data

## Implementation

```typescript
// Require specific permission
await requirePermission("cells.create")(request);

// Check contextual access
if (authCtx.cellRole === "LEADER" && cell.leaderId !== authCtx.userId) {
  throw AppError.forbidden("You can only edit cells you lead.");
}
```

## Platform Admin (Separate)

Internal SaaS admin roles are separate from Organization roles:
- PLATFORM_OWNER, PLATFORM_ADMIN, PLATFORM_SUPPORT, PLATFORM_FINANCE, PLATFORM_READONLY
