# 🔐 Production Environment Variables

Sätt dessa i Railway dashboard under "Variables":

## Kritiska (MÅSTE sättas)

```bash
# Database
DATABASE_URL="postgresql://postgres:PoUwZQKBHOVCIrkHlRNGLykOPTyBtMor@yamanote.proxy.rlwy.net:23397/railway"

# OpenAI API
OPENAI_API_KEY="sk-proj-..." # Din production key från platform.openai.com

# Admin Security (generera: openssl rand -base64 32)
ADMIN_TOKEN="<strong-random-token-here>"

# JWT Secret (generera: openssl rand -base64 64)
JWT_SECRET="<strong-random-secret-here>"

# Application
NODE_ENV="production"
NEXT_PUBLIC_SITE_URL="https://optero-production.up.railway.app"
```

## Valfria (lägg till senare)

```bash
# Error Tracking
SENTRY_DSN="https://...@sentry.io/..."

# Email Service (Resend)
RESEND_API_KEY="re_..."

# Analytics
NEXT_PUBLIC_GA_ID="G-..."
```

## 🔧 Hur man sätter i Railway:

1. Gå till Railway dashboard
2. Välj ditt projekt
3. Settings → Variables
4. Add Variable (för varje ovan)
5. Deploy kommer triggas automatiskt

## ⚠️ Säkerhet:

- **NEVER** committa .env-filer till git
- Rotera secrets var 90:e dag
- Använd olika keys för dev/prod
- Sätt rate limits på OpenAI production key

## 🧪 Test att allt fungerar:

```bash
# Test admin auth (ska ge 401 utan token)
curl -X POST https://optero-production.up.railway.app/api/admin/purge-bots?all=true

# Test med token (ska fungera)
curl -X POST "https://optero-production.up.railway.app/api/admin/purge-bots?all=true&token=YOUR-ADMIN-TOKEN"
```

