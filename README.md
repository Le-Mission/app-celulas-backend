# Le Mission Backend

Multi-tenant SaaS backend for the Le Mission church management platform.

## Stack

- **Runtime**: Node.js 22+ / TypeScript strict / ESM
- **HTTP**: Fastify 5
- **Auth**: Clerk (`@clerk/fastify`)
- **ORM**: Prisma 6
- **Database**: PostgreSQL (Neon)
- **Storage**: Wasabi S3
- **Payments**: AbacatePay v2
- **Validation**: Zod
- **Tests**: Vitest

## Quick Start

```bash
# Install dependencies
npm install

# Start database
docker compose up -d

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Start development server
npm run dev
```

## API

- Health: `GET /health`, `GET /ready`
- Docs: `GET /docs` (Swagger UI)
- API: `GET /api/v1/*`

## Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint source
npm run typecheck    # Type check
npm test             # Run tests
npx prisma studio    # Database GUI
```

## Architecture

Modular monolith with DDD layers:
- `src/core/` — Domain logic
- `src/providers/` — External service adapters
- `src/modules/` — Feature modules
- `src/plugins/` — Fastify plugins

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

## License

MIT
