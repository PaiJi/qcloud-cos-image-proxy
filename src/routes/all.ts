import { Hono } from "hono";
import { env } from "hono/adapter";
import "dotenv/config";

import COS from "cos-nodejs-sdk-v5";
import type { NodeJSEnv } from "@/types/env";
import { buildURL, fetchCOSObject } from "@/polyfills/cos";

const imageHandler = new Hono();

imageHandler.get("*", async (c) => {
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

export default imageHandler;
