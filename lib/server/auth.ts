import { betterAuth } from "better-auth";

interface CloudflareBindings {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  BETTER_AUTH_SECRET: string;
  ENVIRONMENT: string;
}

export function createAuth(
  env?: CloudflareBindings,
  cf?: IncomingRequestCfProperties,
  baseURL?: string
) {
  if (!env || !env.DB) {
    return betterAuth({
      emailAndPassword: { enabled: true },
    });
  }

  return betterAuth({
    baseURL,
    database: customD1Adapter(env.DB),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 100,
    },
    secondaryStorage: {
      get: async (key) => env.KV.get(key),
      set: async (key, value, ttl) => {
        await env.KV.put(key, value, ttl ? { expirationTtl: Math.max(60, ttl) } : undefined);
      },
      delete: async (key) => env.KV.delete(key),
    },
  });
}

function toSnake(str: string): string {
  return str.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);
}

function modelToTable(model: string): string {
  switch (model) {
    case "user": return "users";
    case "session": return "session";
    case "account": return "account";
    case "verification": return "verification";
    default: return model + "s";
  }
}

function convertData(data: Record<string, any>): { keys: string[]; values: any[] } {
  const keys: string[] = [];
  const values: any[] = [];
  for (const [k, v] of Object.entries(data)) {
    keys.push(toSnake(k));
    values.push(v instanceof Date ? v.toISOString() : v);
  }
  return { keys, values };
}

function createCustomD1Adapter(db: D1Database) {
  return () => ({
    create: async ({ model, data }: any) => {
      const table = modelToTable(model);
      const { keys, values } = convertData(data);
      const cols = keys.join(", ");
      const ph = keys.map(() => "?").join(", ");

      const r = await db.prepare(
        `INSERT INTO ${table} (${cols}) VALUES (${ph}) RETURNING *`
      ).bind(...values).all();

      return r.results?.[0] || null;
    },
    findOne: async ({ model, where }: any) => {
      const table = modelToTable(model);
      if (!where?.length) return null;
      const clauses = where.map((w: any) => `${toSnake(w.field)} = ?`);
      const vals = where.map((w: any) => w.value);

      const r = await db.prepare(
        `SELECT * FROM ${table} WHERE ${clauses.join(" AND ")} LIMIT 1`
      ).bind(...vals).all<Record<string, any>>();

      return r.results?.[0] || null;
    },
    findMany: async ({ model, where, limit, sortBy, offset }: any) => {
      const table = modelToTable(model);
      let sql = `SELECT * FROM ${table}`;
      const vals: any[] = [];

      if (where?.length) {
        const clauses = where.map((w: any) => {
          vals.push(w.value);
          return `${toSnake(w.field)} = ?`;
        });
        sql += ` WHERE ${clauses.join(" AND ")}`;
      }

      if (sortBy?.field) {
        sql += ` ORDER BY ${toSnake(sortBy.field)} ${sortBy.direction === "desc" ? "DESC" : "ASC"}`;
      }
      if (limit) sql += ` LIMIT ${limit}`;
      if (offset) sql += ` OFFSET ${offset}`;

      const r = await db.prepare(sql).bind(...vals).all<Record<string, any>>();
      return r.results || [];
    },
    update: async ({ model, where, data }: any) => {
      const table = modelToTable(model);
      const { keys, values } = convertData(data);
      const setClauses = keys.map((k) => `${k} = ?`);

      const wClauses = where.map((w: any) => `${toSnake(w.field)} = ?`);
      const wVals = where.map((w: any) => w.value);

      await db.prepare(
        `UPDATE ${table} SET ${setClauses.join(", ")} WHERE ${wClauses.join(" AND ")}`
      ).bind(...values, ...wVals).run();

      const r = await db.prepare(
        `SELECT * FROM ${table} WHERE ${wClauses.join(" AND ")}`
      ).bind(...wVals).all<Record<string, any>>();

      return r.results?.[0] || null;
    },
    delete: async ({ model, where }: any) => {
      const table = modelToTable(model);
      const clauses = where.map((w: any) => `${toSnake(w.field)} = ?`);
      const vals = where.map((w: any) => w.value);

      const r = await db.prepare(
        `DELETE FROM ${table} WHERE ${clauses.join(" AND ")} RETURNING *`
      ).bind(...vals).all<Record<string, any>>();

      return r.results?.[0] || null;
    },
  });
}

const customD1Adapter = (db: D1Database) => createCustomD1Adapter(db);