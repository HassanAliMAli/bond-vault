import { getDb } from "../db";
import { auditLogs } from "../schema";
import { generateId } from "../id";

export async function logAudit(
  env: Env,
  params: {
    userId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    ipAddress?: string;
    metadata?: Record<string, unknown>;
  }
) {
  const db = getDb(env.DB);
  const id = generateId();
  await db.insert(auditLogs).values({
    id,
    userId: params.userId || null,
    action: params.action,
    entityType: params.entityType || null,
    entityId: params.entityId || null,
    ipAddress: params.ipAddress || null,
    metadataJson: params.metadata ? JSON.stringify(params.metadata) : null,
    createdAt: new Date().toISOString(),
  } as any);
}

export function getClientIp(c: any): string {
  const cfIp = c.req.raw?.cf?.requestIp;
  if (cfIp) return cfIp;
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return c.req.header("x-real-ip") || "unknown";
}
