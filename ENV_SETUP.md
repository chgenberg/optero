# 🔐 Environment Variables Setup

## Production .env

Skapa `.env.production` med dessa variabler:

```bash
# Database (Railway Pro or Supabase Pro)
DATABASE_URL="postgresql://user:password@host:port/database"

# Authentication (CRITICAL: Generate new secret!)
JWT_SECRET="CHANGE-THIS-TO-SECURE-RANDOM-STRING"
# Generate with: openssl rand -base64 64

# OpenAI API (Production key with higher limits)
OPENAI_API_KEY="sk-proj-..."

# App Configuration
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://mendio.com"

# Error Tracking (Sentry)
SENTRY_DSN="https://...@sentry.io/..."
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."

# Email Service (Resend or SendGrid)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@mendio.com"

# Analytics (Optional)
NEXT_PUBLIC_GA_ID="G-..."

# Stripe (for subscriptions)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

## Generera säkra secrets

```bash
# JWT Secret
openssl rand -base64 64

# Session Secret
openssl rand -hex 32

# API Keys
# Get from respective platforms
```

## Sätt upp på Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Sätt environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add OPENAI_API_KEY
# ... etc
```

## Sätt upp på Railway

1. Gå till Railway dashboard
2. Välj ditt projekt
3. Variables → Raw Editor
4. Klistra in alla environment variables

## Viktigt!

⚠️ **ALDRIG committa .env till git!**
⚠️ **Byt alla secrets innan produktion!**
⚠️ **Använd olika nycklar för dev/staging/prod!**

