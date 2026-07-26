# Webhooks

## Clerk Webhooks

**Endpoint**: `POST /webhooks/clerk`

### Events

| Event | Action |
|-------|--------|
| user.created | Create internal User |
| user.updated | Sync User profile |
| user.deleted | Mark User as INACTIVE |

### Validation

Handled by `@clerk/fastify` plugin automatically.

## AbacatePay Webhooks

**Endpoint**: `POST /webhooks/abacatepay`

### Events

| Event | Action |
|-------|--------|
| checkout.completed | Mark CheckoutSession COMPLETED |
| checkout.refunded | Record refund |
| checkout.disputed | Record dispute |
| subscription.completed | Activate Subscription |
| subscription.renewed | Record SaaSPayment |
| subscription.cancelled | Cancel Subscription |
| subscription.payment_failed | Handle dunning |

### Validation

HMAC-SHA256 signature using `ABACATEPAY_WEBHOOK_SECRET`.

Header: `x-webhook-signature`

### Idempotency

`WebhookEvent` model with unique constraint `(provider, externalEventId)`.

If event already processed: return 200 without reprocessing.

### Processing

1. Validate signature
2. Check idempotency
3. Record event
4. Process in transaction
5. Mark as PROCESSED
6. Return 200

### Best Practices

- Never reject webhook for unknown fields
- Always return 200 for processed events
- Implement retry-safe handlers
- Log all webhook attempts
