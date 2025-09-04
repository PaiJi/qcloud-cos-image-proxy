import "./instrument.js";

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";

import * as Sentry from "@sentry/node";

import { version } from "../package.json";
import imageHandler from "./routes/all.js";
import { HTTPException } from "hono/http-exception";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
  })
);

app.use("*", requestId());

app.get("/", (c) => {
  return c.json({
    message: "Welcome to COS image proxy.",
    requestId: c.get("requestId"),
    version: version,
  });
});

app.get("/health", (c) => {
  return c.json({
    message: "OK",
    requestId: c.get("requestId"),
    version: version,
  });
});

app.route("/*", imageHandler);

app.notFound((c) => {
  return c.json(
    {
      message: "Your visit URL is not exist or not a valid URL.",
      url: c.req.url,
      method: c.req.method,
      requestId: c.get("requestId"),
      version: version,
    },
    404
  );
});

app.onError((err, c) => {
  // Report _all_ unhandled errors.
  Sentry.captureException(err);
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  // Or just report errors which are not instances of HTTPException
  // Sentry.captureException(err);
  return c.json({ error: "Internal server error" }, 500);
});

const port = 3000;

console.log(`Qcloud COS image proxy is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
