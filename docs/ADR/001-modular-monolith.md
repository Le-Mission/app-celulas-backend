# ADR 001: Modular Monolith

## Status

Accepted

## Context

We need to choose an architecture for the Le Mission backend that supports:
- Multiple consumers (mobile app, admin panel, SaaS admin)
- Multiple domains (church management, billing, files)
- Future growth without premature complexity

## Decision

Use a **modular monolith** architecture:
- Single deployable unit
- Modules organized by domain
- DDD layers within modules
- Provider pattern for external services

## Consequences

### Positive
- Simple deployment and operations
- Easier development and debugging
- Shared database transactions
- Lower operational cost
- Sufficient for initial scale

### Negative
- Modules share process memory
- Scaling is vertical only
- Tighter coupling than microservices

### Mitigations
- Clear module boundaries
- Provider interfaces for external services
- Can extract modules to services later if needed
