// @ts-expect-error — Generated at build time by opennextjs-cloudflare
import { default as handler } from "./.open-next/worker.js";
import { handleQueueMessage } from "./lib/server/queue";

export default {
  fetch: handler.fetch,

  async queue(batch: MessageBatch, env: Env, ctx: ExecutionContext) {
    for (const msg of batch.messages) {
      switch (batch.queue) {
        case "match-generation":
          const body = msg.body as { drawId: string };
          await handleQueueMessage(env, body);
          break;
      }
      msg.ack();
    }
  },
} satisfies ExportedHandler<Env>;
