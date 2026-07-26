# API Contract

## Base URL

```
/api/v1
```

## Response Format

### Success
```json
{ "data": { ... } }
```

### List
```json
{
  "data": [...],
  "page": {
    "cursor": null,
    "nextCursor": "...",
    "hasNextPage": true
  }
}
```

### Error
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Você não possui permissão para esta operação.",
    "details": {},
    "requestId": "uuid"
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHENTICATED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid input |
| CONFLICT | 409 | State conflict |
| PLAN_LIMIT_REACHED | 403 | Plan limit exceeded |
| FEATURE_NOT_AVAILABLE | 403 | Feature not in plan |
| SUBSCRIPTION_REQUIRED | 403 | Active subscription needed |
| PAYMENT_PROVIDER_ERROR | 502 | Payment gateway error |
| WEBHOOK_SIGNATURE_INVALID | 401 | Invalid webhook signature |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

## Authentication

All `/api/v1/*` routes require Clerk JWT in `Authorization: Bearer <token>`.

## Pagination

Cursor-based for large collections:

```
GET /api/v1/audit?cursor=<uuid>&limit=20
```

## Webhooks

- `POST /webhooks/clerk` — Clerk user events
- `POST /webhooks/abacatepay` — AbacatePay payment events

Webhooks are not authenticated via Clerk JWT. They use their own signature validation.
