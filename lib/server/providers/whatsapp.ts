export async function sendWhatsApp(params: { userId: string; title: string | null; message: string | null }) {
  console.warn(`[WhatsApp] Skipping notification for user ${params.userId}: provider not configured`);
  throw new Error("WhatsApp provider not configured");
}
