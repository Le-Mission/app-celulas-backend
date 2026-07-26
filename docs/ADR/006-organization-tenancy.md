# ADR 006: Organization as SaaS Tenant

## Status

Accepted

## Context

We need to model multi-tenancy for:
- SaaS billing (one subscription per tenant)
- Multiple churches per organization
- Denomination-level deployment

## Decision

Use **Organization** as the SaaS tenant:
- Organization = billing and admin entity
- Church = operational ecclesiastical unit
- One Organization has many Churches
- Billing is at Organization level

## Consequences

### Positive
- Supports denomination-level deployment
- Clean billing boundary (one subscription per org)
- Supports multi-church organizations
- Clear administrative hierarchy

### Negative
- Extra layer of indirection
- Need to resolve organization from user context

### Mitigations
- Tenant resolver handles resolution automatically
- All queries scoped to organizationId
- Church is optional for some operations
