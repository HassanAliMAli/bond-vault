/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  BETTER_AUTH_SECRET: string;
  RESEND_API_KEY?: string;
  WHATSAPP_API_KEY?: string;
  SMS_API_KEY?: string;
  ENVIRONMENT: string;
  MatchGenerationQueue: Queue;
  NotificationDeliveryQueue: Queue;
  DrawProcessingQueue: Queue;
  CleanupJobsQueue: Queue;
}
