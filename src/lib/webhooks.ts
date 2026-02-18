export async function sendWebhook(
  webhookUrl: string,
  payload: {
    txHash: string;
    amount: number;
    linkId: string;
    status: string;
  }
): Promise<boolean> {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}
