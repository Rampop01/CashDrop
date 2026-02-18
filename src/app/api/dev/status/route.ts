import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPaymentStatus } from "@/lib/payment-monitor";

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "API key required" }, { status: 401 });
  }

  const devApp = await prisma.developerApp.findUnique({ where: { apiKey } });
  if (!devApp) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const linkId = req.nextUrl.searchParams.get("linkId");
  if (!linkId) {
    return NextResponse.json({ error: "linkId is required" }, { status: 400 });
  }

  const link = await prisma.paymentLink.findUnique({
    where: { id: linkId },
    include: { transactions: true },
  });

  if (!link || link.userId !== devApp.userId) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  const liveStatus = await checkPaymentStatus(
    link.bchAddress,
    link.amountBCH || undefined
  );

  return NextResponse.json({
    linkId: link.id,
    title: link.title,
    bchAddress: link.bchAddress,
    amountBCH: link.amountBCH,
    status: link.status,
    liveCheck: liveStatus,
    transactions: link.transactions.map((tx) => ({
      txHash: tx.txHash,
      amount: tx.amountBCH,
      confirmations: tx.confirmations,
      detectedAt: tx.detectedAt,
    })),
  });
}
