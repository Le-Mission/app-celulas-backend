# Billing Architecture

## Separation of Concerns

Two distinct financial contexts:

### SaaSBilling
- Plan subscription
- Monthly/yearly billing
- Checkout and payment
- Dunning and grace period
- Entitlements

### ChurchFinance (Future)
- Tithes and offerings
- Donations
- Campaigns
- Income and expenses
- Cost centers

**These contexts do NOT share tables.**

## Models

- **Plan**: SaaS plan (SOLO, LOCAL, INSTITUTIONAL)
- **PlanFeature**: Feature entitlements per plan
- **BillingAccount**: External customer link
- **Subscription**: Active plan subscription
- **CheckoutSession**: Payment checkout tracking
- **SaaSPayment**: Individual payment records
- **WebhookEvent**: Idempotency tracking

## Subscription Lifecycle

```
INCOMPLETE → TRIALING → ACTIVE
                          ↓
                     PAST_DUE → SUSPENDED
                          ↓
                     CANCELED → EXPIRED
```

## Checkout Flow

1. User selects plan
2. Backend validates membership + billing.manage permission
3. Backend loads plan from database (never from client)
4. Backend creates/loads BillingAccount
5. Backend creates CheckoutSession
6. Backend calls AbacatePay → returns checkout URL
7. Frontend redirects user to checkout
8. Webhook confirms payment → activates subscription
9. Entitlements recalculated

## Webhook Events

| External Event | Internal Action |
|---------------|-----------------|
| checkout.completed | Mark CheckoutSession COMPLETED |
| subscription.completed | Activate Subscription |
| subscription.renewed | Record SaaSPayment |
| subscription.cancelled | Cancel Subscription |
| subscription.payment_failed | Increment attempts, possibly suspend |

## Idempotency

`WebhookEvent` model with `unique(provider, externalEventId)` prevents duplicate processing.

## Grace Period

Configurable `BILLING_GRACE_PERIOD_DAYS` (default: 7).
- ACTIVE: Full access
- PAST_DUE: Grace period
- SUSPENDED: Read-only access
- CANCELED: Access until period end
- EXPIRED: Blocked features
