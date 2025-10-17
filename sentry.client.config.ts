// Sentry client is optional; only initialize if package and DSN exist
let SentryClient: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SentryClient = require('@sentry/nextjs');
} catch {}

if (SentryClient && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  SentryClient.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
}


