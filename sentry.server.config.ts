// Sentry server is optional; only initialize if package and DSN exist
let SentryServer: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SentryServer = require('@sentry/nextjs');
} catch {}

if (SentryServer && process.env.SENTRY_DSN) {
  SentryServer.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
}


