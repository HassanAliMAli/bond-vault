import { generateMatchesForDraw } from "./services/matches";

export async function handleQueueMessage(env: Env, message: { drawId: string }): Promise<void> {
  const { drawId } = message;
  await generateMatchesForDraw(env, drawId);
}
