import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'https://8dfce1e392319906edc257860dfb10b2@o4512482588688384.ingest.us.sentry.io/4512482596225024',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Tracing
  // Capture 100% of spans. Reduce this value in production.
  tracesSampleRate: 1.0,
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ['localhost'],
  // Session Replay
  // Capture 10% of all sessions, plus 100% of sessions with an error.
  // You may want to capture 100% of sessions while in development.
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
