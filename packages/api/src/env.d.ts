interface Env {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  MATCH_QUEUE: Queue;
  NOTIFICATION_QUEUE: Queue;
  CLEANUP_QUEUE: Queue;
  DRAW_QUEUE: Queue;
  BETTER_AUTH_SECRET: string;
  ENVIRONMENT: string;
}
