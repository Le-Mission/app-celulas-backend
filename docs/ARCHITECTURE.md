# Architecture

## Overview

Le Mission Backend is a **modular monolith** built with Fastify, TypeScript, Prisma, and Clerk. It serves as the multi-tenant SaaS backend for the Le Mission church management platform.

## Stack

- **Runtime**: Node.js 22+ / TypeScript strict / ESM
- **HTTP**: Fastify 5
- **Auth**: Clerk (`@clerk/fastify`)
- **ORM**: Prisma 6
- **Database**: PostgreSQL (Neon)
- **Storage**: Wasabi S3
- **Payments**: AbacatePay v2
- **Validation**: Zod
- **Docs**: OpenAPI / Swagger UI
- **Tests**: Vitest
- **Logs**: Pino

## Architecture Pattern

```
Modular Monolith
├── src/
│   ├── core/          # Domain logic (DDD)
│   │   ├── domain/        # Entities, value objects
│   │   ├── application/   # Use cases
│   │   ├── infrastructure/# External implementations
│   │   ├── errors/        # AppError
│   │   ├── events/        # Domain event bus
│   │   ├── permissions/   # RBAC engine
│   │   ├── tenancy/       # Tenant resolution
│   │   ├── entitlements/  # Plan feature checks
│   │   └── pagination/    # Cursor helpers
│   ├── providers/     # External service adapters
│   │   ├── identity/      # Clerk
│   │   ├── payments/      # AbacatePay
│   │   ├── storage/       # Wasabi S3
│   │   ├── cache/         # InMemory
│   │   └── jobs/          # Inline queue
│   ├── plugins/       # Fastify plugins
│   ├── modules/       # Feature modules (routes + logic)
│   └── shared/        # Schemas, types, constants
```

## Request Flow

```
Request → Fastify
  → securityPlugin (Helmet, CORS, rate limit)
  → requestContextPlugin (requestId)
  → clerkPlugin (JWT verification)
  → authPlugin (auth context)
  → Module route handler
    → resolveAuthContext (User + Org + Permissions)
    → Permission check
    → Entitlement check
    → Use case / Prisma query
    → Response
```

## Provider Pattern

External services are abstracted behind interfaces:

- `IdentityProvider` → `ClerkIdentityProvider`
- `PaymentGateway` → `AbacatePayGateway` / `FakePaymentGateway`
- `StorageProvider` → `WasabiStorageProvider` / `FakeStorageProvider`
- `CacheProvider` → `InMemoryCacheProvider`
- `JobQueue` → `InlineJobQueue`

Domain logic never depends on external SDKs directly.

## Modules

| Module | Prefix | Description |
|--------|--------|-------------|
| health | `/health`, `/ready` | Liveness/readiness probes |
| auth | `/api/v1/auth/bootstrap`, `/webhooks/clerk` | User bootstrap, Clerk events |
| users | `/api/v1/users` | User profile CRUD |
| organizations | `/api/v1/organizations` | Org CRUD + membership |
| churches | `/api/v1/organizations/:id/churches` | Church CRUD + membership |
| cells | `/api/v1/churches/:id/cells` | Cell CRUD + membership |
| files | `/api/v1/files` | Presigned upload/download |
| audit | `/api/v1/audit` | Audit log queries |
| plans | `/api/v1/plans` | Plan listing |
| subscriptions | `/api/v1/billing/subscription` | Subscription lifecycle |
| billing | `/api/v1/billing`, `/webhooks/abacatepay` | Checkout, payments, webhooks |
| entitlements | `/api/v1/entitlements` | Feature checks |
