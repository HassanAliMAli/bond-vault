export async function checkRateLimit(
  kv: KVNamespace,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const windowKey = Math.floor(now / (windowSeconds * 1000));
  const kvKey = `ratelimit:${key}:${windowKey}`;

  const current = await kv.get<number>(kvKey, "json");
  const count = (current as number) || 0;

  if (count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  await kv.put(kvKey, JSON.stringify(count + 1), {
    expirationTtl: windowSeconds,
  });

  return { allowed: true, remaining: limit - count - 1 };
}

export const RATE_LIMITS = {
  register: { limit: 10, window: 3600 },
  login: { limit: 20, window: 3600 },
  ocr: { limit: 100, window: 3600 },
  imports: { limit: 20, window: 3600 },
  contact: { limit: 5, window: 3600 },
  api: { limit: 300, window: 60 },
} as const;
