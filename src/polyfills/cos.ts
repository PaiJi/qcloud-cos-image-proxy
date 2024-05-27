import COS from "cos-nodejs-sdk-v5";
import { Context, Env } from "hono";
import { env } from "hono/adapter";
import "dotenv/config";

import { BlankInput } from "hono/types";
import { NodeJSEnv } from "../types/env";

export async function fetchCOSObject(
  url: string,
  method: COS.Method,
  objectKey: string,
  c: Context<Env, "*", BlankInput>
) {
  const { SecretId, SecretKey, BUCKET_URL } = env<NodeJSEnv>(c);

  const authToken = COS.getAuthorization({
    SecretId: SecretId,
    SecretKey: SecretKey,
    Method: method,
    Key: objectKey,
    // Expires: 60,
    Query: {},
    Headers: {},
  });

  const response = await fetch(url, {
    headers: {
      ...c.req.header,
      Host: BUCKET_URL,
      authorization: authToken,
    },
  });

  if (response.status === 404) {
    return c.notFound();
  }
  const newResponse = new Response(response.body, response);
  newResponse.headers.set("Content-Disposition", "inline");
  return newResponse;
}

export function buildURL({
  url,
  format,
  width,
  height,
  quality,
}: {
  url: URL;
  format: string | null;
  width?: string | null;
  height?: string | null;
  quality?: string | null;
}) {
  const queryParams = [];

  const widthBuilder = (width: string) =>
    `imageMogr2/thumbnail/${width}x/ignore-error/1`;
  const qualityBuilder = (quality: string) =>
    quality !== "auto"
      ? `imageMogr2/quality/${quality}/ignore-error/1/minisize/1`
      : "imageSlim";
  const formatBuilder = (format: string) =>
    `imageMogr2/format/${format}/minisize/1/ignore-error/1`;

  if (width) {
    queryParams.push(widthBuilder(width));
  }

  if (quality) {
    queryParams.push(qualityBuilder(quality));
  }

  if (format) {
    queryParams.push(formatBuilder(format));
  }

  const finalQueryParams = queryParams.join("|");
  // remove search params.
  url.search = "";
  const pathname = url.pathname;
  const finalPathname = `${pathname}${
    finalQueryParams.length ? `?${finalQueryParams}` : ""
  }`;

  return finalPathname;
}
