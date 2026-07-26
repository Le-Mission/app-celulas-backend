# Domain Model

## Core Aggregates

### Organization (SaaS Tenant)
- The billing and administrative entity
- One Organization has many Churches
- One Organization has one BillingAccount
- One Organization has one Subscription

### Church (Operational Unit)
- The ecclesiastical unit managed by an Organization
- One Church has many Cells
- One Church has many ChurchMemberships

### Cell
- Small group within a Church
- Has a leader and members
- Has meeting schedule

### User
- Internal user profile (synced from Clerk)
- Has OrganizationMemberships and ChurchMemberships

## Relationships

```
Organization
├── OrganizationMembership[] → User
├── Church[]
│   ├── ChurchMembership[] → User
│   └── Cell[]
│       └── CellMembership[] → User
├── BillingAccount
├── Subscription → Plan
├── SaaSPayment[]
├── CheckoutSession[]
├── FileObject[]
├── AuditLog[]
└── UsageCounter[]
```

## Billing Context

```
Plan
├── PlanFeature[] (features, limits)
└── Subscription[]

Subscription
├── BillingAccount
├── CheckoutSession[]
└── SaaSPayment[]
```

## Key Invariants

- Every business entity belongs to an Organization
- Church entities also have a churchId
- User auth is via Clerk; internal profile is in PostgreSQL
- Subscription status drives entitlements
- Webhook events are idempotent (WebhookEvent model)
