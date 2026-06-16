import { Hono } from "hono";
import { success, error } from "../lib";

export const externalDrawRoutes = new Hono()
  .get("/external/draws", async (c) => {
    const r2 = c.env.R2;
    const denom = c.req.query("denomination");
    const prefix = denom ? `draws/${denom}/` : "draws/";

    let objects: R2Object[];
    try {
      const result = await r2.list({ prefix, limit: 500 });
      objects = result.objects;
    } catch {
      return error(c, "STORAGE_ERROR", "Failed to list draws", 500);
    }

    const draws = [];
    for (const obj of objects) {
      if (!obj.key.endsWith(".json") || obj.key === "draws/index.json") continue;
      try {
        const data = await r2.get(obj.key);
        if (data) {
          const text = await data.text();
          draws.push(JSON.parse(text));
        }
      } catch {
        // skip unparseable files
      }
    }

    draws.sort((a, b) => {
      const da = a.drawDate || "";
      const db = b.drawDate || "";
      return db.localeCompare(da);
    });

    return success(c, { draws });
  })

  .get("/external/draws/index", async (c) => {
    const r2 = c.env.R2;
    try {
      const obj = await r2.get("draws/index.json");
      if (!obj) return error(c, "NOT_FOUND", "Index not found", 404);
      const text = await obj.text();
      return success(c, JSON.parse(text));
    } catch {
      return error(c, "STORAGE_ERROR", "Failed to read index", 500);
    }
  })

  .get("/external/draws/:denomination/:date", async (c) => {
    const r2 = c.env.R2;
    const denom = c.req.param("denomination");
    const date = c.req.param("date");
    const key = `draws/${denom}/${date}.json`;

    try {
      const obj = await r2.get(key);
      if (!obj) return error(c, "NOT_FOUND", "Draw not found", 404);
      const text = await obj.text();
      return success(c, JSON.parse(text));
    } catch {
      return error(c, "STORAGE_ERROR", "Failed to read draw", 500);
    }
  });
