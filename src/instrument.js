import * as Sentry from "@sentry/node";
//  profiling
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import "dotenv/config";
//  profiling
// Ensure to call this before importing any other modules!
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/hono/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
  //  profiling
  integrations: [
    // Add our Profiling integration
    nodeProfilingIntegration(),
  ],
  //  profiling
  //  performance
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for tracing.
  // We recommend adjusting this value in production
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/guides/hono/configuration/options/#tracesSampleRate
  tracesSampleRate: 1.0,
  //  performance
  //  profiling
  // Set profilesSampleRate to 1.0 to profile 100%
  // of sampled transactions.
  // This is relative to tracesSampleRate
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/guides/hono/configuration/options/#profilesSampleRate
  profilesSampleRate: 1.0,
  //  profiling
  //  logs
  // Enable logs to be sent to Sentry
  enableLogs: true,
  //  logs
});