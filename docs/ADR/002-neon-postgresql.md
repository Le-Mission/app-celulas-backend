# ADR 002: Neon PostgreSQL

## Status

Accepted

## Context

We need a PostgreSQL database that supports:
- Serverless/edge compatibility
- Connection pooling
- Migrations
- Standard PostgreSQL features

## Decision

Use **Neon PostgreSQL** with standard PrismaClient:
- `DATABASE_URL` with `-pooler` suffix for runtime
- `DIRECT_DATABASE_URL` for migrations
- No `@prisma/adapter-neon` (not needed for traditional server)

## Consequences

### Positive
- Serverless-friendly connection pooling
- Standard PostgreSQL compatibility
- No vendor lock-in for database features
- Simple Prisma configuration

### Negative
- Neon-specific features should not be used in domain logic
- Need to manage two connection URLs

### Mitigations
- Use standard SQL only
- Document connection URL requirements
