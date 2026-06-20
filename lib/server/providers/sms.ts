export async function sendSms(params: { userId: string; title: string | null; message: string | null }) {
  console.warn(`[SMS] Skipping notification for user ${params.userId}: provider not configured`);
  throw new Error("SMS provider not configured");
}
