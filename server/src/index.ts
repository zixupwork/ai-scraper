import { Hono } from "hono";
import { cors } from "hono/cors";
import { extractWithAI } from "./extract";
import {
  insertExtraction,
  listExtractions,
  deleteExtraction,
} from "./db";

const app = new Hono();

app.use("*", cors({ origin: "*" }));

app.post("/api/extract", async (c) => {
  const body = await c.req.json<{
    text: string;
    url: string;
    title: string;
  }>();

  if (!body.text?.trim()) {
    return c.json({ error: "No text provided" }, 400);
  }

  const result = await extractWithAI(body.text, body.url);

  const [row] = insertExtraction.all(
    body.url,
    body.title ?? "",
    body.text,
    JSON.stringify(result)
  );

  return c.json({ id: row.id, result });
});

app.get("/api/extractions", (c) => {
  const rows = listExtractions.all();
  return c.json(
    rows.map((r) => ({ ...r, result: JSON.parse(r.result) }))
  );
});

app.delete("/api/extractions/:id", (c) => {
  const id = Number(c.req.param("id"));
  deleteExtraction.run(id);
  return c.json({ ok: true });
});

export default {
  port: 3579,
  fetch: app.fetch,
};

console.log("AI Scraper server running on http://localhost:3579");
