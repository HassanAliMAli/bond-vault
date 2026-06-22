// @ts-expect-error — Generated at build time by opennextjs-cloudflare
import { default as handler } from "./.open-next/worker.js";
import { handleQueueMessage } from "./lib/server/queue";

export default {
  fetch: handler.fetch,

  async queue(batch: MessageBatch, env: Env, _ctx: ExecutionContext) {
    for (const msg of batch.messages) {
      await handleQueueMessage(env, { queue: batch.queue, body: msg.body });
      msg.ack();
    }
  },
} satisfies ExportedHandler<Env>;
