# ADR 003: Clerk Identity

## Status

Accepted

## Context

We need authentication that supports:
- Social login providers
- JWT-based auth
- Session management
- Fastify integration

## Decision

Use **Clerk** for identity management:
- `@clerk/fastify` plugin
- JWT verification on every request
- Webhook for user sync
- DB stores internal profile + memberships

## Consequences

### Positive
- Battle-tested auth infrastructure
- Multiple social providers
- Managed session lifecycle
- Fastify plugin available

### Negative
- External dependency for auth
- Need to sync user data via webhook/bootstrap
- Clerk rate limits apply

### Mitigations
- Bootstrap endpoint for reconciliation
- Idempotent webhook handlers
- Internal user record as source of truth
