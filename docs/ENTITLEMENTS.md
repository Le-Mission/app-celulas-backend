# Entitlements

## Concept

Entitlements answer: "Does the subscribed plan include this feature?"

This is separate from RBAC (which answers: "Does the user have permission?").

## Plan Features

Each Plan has PlanFeatures:

| Feature | Type | Example |
|---------|------|---------|
| churches.max | NUMBER + FIXED | 3 |
| members.max | NUMBER + UNLIMITED | -1 |
| cells.max | NUMBER + FIXED | 20 |
| storage.bytes | NUMBER + FIXED | 5GB |
| advanced_reports | BOOLEAN | true |
| financial_module | BOOLEAN | true |
| custom_branding | BOOLEAN | false |

## Usage Counters

Track current usage per organization:

- `storage.bytes` — total file storage used
- `members.count` — total members
- `cells.count` — total cells
- `churches.count` — total churches

## API

```typescript
// Check if feature is available
await entitlementService.assertFeature(orgId, "advanced_reports");

// Check if limit is not exceeded
await entitlementService.assertLimit(orgId, "members.max", currentCount);

// Get all entitlements
const entitlements = await entitlementService.getEntitlements(orgId);
```

## Flow

```
Request → Auth → Permission Check → Entitlement Check → Use Case
```

Both RBAC and Entitlements must pass for the operation to succeed.
