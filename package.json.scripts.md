# Lägg till dessa scripts i package.json

Öppna `package.json` och lägg till under "scripts":

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:push": "prisma db push",
    "db:seed": "tsx scripts/seed-demo-company.ts",
    "db:studio": "prisma studio",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "setup": "./setup.sh",
    "deploy:prod": "./deploy-production.sh",
    "test:load": "k6 run tests/load-test.js",
    "sentry:sourcemaps": "sentry-cli sourcemaps upload --org your-org --project your-project .next"
  }
}
```

## Användning:

```bash
# Development
npm run dev           # Starta dev server
npm run db:studio     # Öppna Prisma Studio
npm run db:seed       # Seed demo data

# Production
npm run type-check    # Check TypeScript
npm run build         # Build production
npm run deploy:prod   # Deploy till Vercel

# Database
npm run db:push       # Push schema changes
npm run db:migrate    # Create migration
npm run db:generate   # Generate Prisma Client
```
