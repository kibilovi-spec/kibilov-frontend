import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN_FRONTEND,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    if (event.environment === 'development') return null;
    const msg = hint?.originalException?.message || event.exception?.values?.[0]?.value || '';
    if (msg.includes('Failed to find Server Action')) return null;
    return event;
  },
});
