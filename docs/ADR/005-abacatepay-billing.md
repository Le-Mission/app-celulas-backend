# ADR 005: AbacatePay Billing

## Status

Accepted

## Context

We need SaaS billing that supports:
- Recurring subscriptions
- PIX and credit card payments
- Brazilian market (BRL)
- Webhook-driven payment confirmation

## Decision

Use **AbacatePay v2** for SaaS billing:
- `@abacatepay/sdk` (official TypeScript SDK)
- Checkout-hosted flow (no card data on our servers)
- Subscription management
- Webhook events for payment confirmation
- HMAC signature validation

## Consequences

### Positive
- Brazilian payment gateway (PIX native)
- Simple API design
- TypeScript SDK available
- Webhook-driven (no polling)
- Dev mode for testing

### Negative
- External dependency for payments
- Need to handle webhook idempotency
- Subscription lifecycle complexity

### Mitigations
- PaymentGateway interface with FakePaymentGateway for tests
- WebhookEvent model for idempotency
- Clear subscription state machine
