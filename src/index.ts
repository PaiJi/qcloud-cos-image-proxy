import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import imageHandler from "./routes/all.js";

const app = new Hono();

app.all("/", (c) => {
  return c.text("Welcome to FEC COS image proxy.", 404);
});

app.use(
  "*",
  cors({
    origin: ["https://www.furrycons.cn", "https://www.furryeventchina.com"],
  })
);

app.route("/", imageHandler);

app.notFound((c) => {
  return c.text(
    "Welcome to FEC COS image proxy, your visit URL is not exist.",
    404
  );
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
