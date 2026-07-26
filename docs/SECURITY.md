# Security

## Infrastructure

- **Helmet**: HTTP security headers
- **CORS**: Explicit origin allowlist
- **Rate Limiting**: 100 requests/minute per IP
- **Body Limit**: 10MB max request body
- **Request IDs**: Every request gets a unique ID

## Authentication

- Clerk handles JWT verification via `@clerk/fastify` plugin
- JWT is verified on every `/api/v1/*` request
- User is resolved from Clerk to internal profile

## Authorization

- **RBAC**: Role-based access control with Organization and Church scopes
- **Contextual Auth**: LEADER can only edit cells they lead
- **Permission Catalog**: Centralized permission keys
- **Entitlement Checks**: Plan-based feature/limit validation

## Tenant Isolation

- Every query is scoped to `organizationId`
- `organizationId` is resolved from auth context, never from request body
- Cross-tenant access is blocked at resolver level

## Webhook Security

- AbacatePay webhooks validated via HMAC-SHA256 signature
- Clerk webhooks validated by `@clerk/fastify`
- Idempotency via `WebhookEvent` unique constraint

## Secrets

- Never committed to repository
- Never logged (Pino redact on sensitive fields)
- Never returned in API responses

## Sensitive Data

- CPF/CNPJ encrypted at rest (`taxIdEncrypted`)
- No card numbers stored (checkout-hosted flow)
- Presigned URLs have short TTL
- Signed URLs not logged

## LGPD

See `docs/PRIVACY.md` for data handling policies.
Requires legal review for compliance certification.
