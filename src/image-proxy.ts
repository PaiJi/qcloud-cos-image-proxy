import { Hono } from "hono";
import { env } from "hono/adapter";
import "dotenv/config";

import { NodeJSEnv } from "./types/env";
import { buildURL, fetchCOSObject } from "./polyfills/cos";
import COS from "cos-nodejs-sdk-v5";

const app = new Hono();

app.get("*", async (c) => {
  const { BUCKET_URL } = env<NodeJSEnv>(c);
  const url = new URL(c.req.url);

  const width = url.searchParams.get("w");
  const quality = url.searchParams.get("q");
  const format = url.searchParams.get("f");

  const isHaveParams = width || quality || format;
  console.log("isHaveParams", isHaveParams);

  const pathname = url.pathname;
  if (isHaveParams) {
    const cosURL = buildURL({ url, format, width, quality });
    return fetchCOSObject(
      `https://${BUCKET_URL}${cosURL}`,
      c.req.method as COS.Method,
      pathname,
      c
    );
  }
  return fetchCOSObject(
    `https://${BUCKET_URL}${pathname}`,
    c.req.method as COS.Method,
    pathname,
    c
  );
});

export default app;
