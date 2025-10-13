import "./instrument.js";
import * as Sentry from "@sentry/node";

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { HTTPException } from "hono/http-exception";
import { env } from "hono/adapter";
import { buildURL, fetchCOSObject } from "@/polyfills/cos.js";

import { NodeJSEnv } from "@/types/env.js";
import COS from "cos-nodejs-sdk-v5";

import packageJson from "../package.json" assert { type: "json" };

const { version } = packageJson;

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

app.get("*", async (c) => {
  const { BUCKET_URL } = env<NodeJSEnv>(c);

  const originUrl = new URL(c.req.url);
  const originPathname = originUrl.pathname;
  const originFullPath = `${originPathname}${originUrl.search}`;

  const width = originUrl.searchParams.get("w");
  const height = originUrl.searchParams.get("h");
  const quality = originUrl.searchParams.get("q");
  const format = originUrl.searchParams.get("f");
  const dependOn = originUrl.searchParams.get("dependOn") as
    | "width"
    | "height"
    | undefined;

  const isHaveParams = width || height || quality || format;
  //Disallow access folder.
  const isFile = originUrl.pathname.split(".").pop() || "";

  if (!isFile) {
    return c.notFound();
  }

  if (isHaveParams) {
    const cosPathname = buildURL({
      url: originUrl,
      format,
      width,
      height,
      dependOn,
      quality,
    });
    return fetchCOSObject(
      `https://${BUCKET_URL}${cosPathname}`,
      c.req.method as COS.Method,
      originPathname,
      c
    );
  }

  return fetchCOSObject(
    `https://${BUCKET_URL}${originPathname}`,
    c.req.method as COS.Method,
    originPathname,
    c
  );
});

app.notFound((c) => {
  return c.json(
    {
      message: "Your visit URL is not exist or not a valid URL.",
      url: c.req.path,
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
