# ADR 004: Wasabi Storage

## Status

Accepted

## Context

We need object storage for:
- File uploads (documents, images)
- Private bucket (no public URLs)
- Presigned URLs for upload/download
- S3-compatible API

## Decision

Use **Wasabi S3** for file storage:
- `@aws-sdk/client-s3` for operations
- `@aws-sdk/s3-request-presigner` for presigned URLs
- Private bucket
- Provider abstraction for testing

## Consequences

### Positive
- S3-compatible (standard API)
- Lower cost than AWS S3
- No egress fees
- Presigned URL support

### Negative
- Additional infrastructure dependency
- Need to manage credentials securely

### Mitigations
- StorageProvider interface with FakeStorageProvider for tests
- Credentials via environment variables only
- Presigned URLs with short TTL
