import { NextRequest, NextResponse } from "next/server";
import { checkPaymentStatus } from "@/lib/payment-monitor";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  const amount = req.nextUrl.searchParams.get("amount");

  if (!address) {
    return NextResponse.json({ error: "address is required" }, { status: 400 });
  }

  const expectedAmount = amount ? parseFloat(amount) : undefined;
  const status = await checkPaymentStatus(address, expectedAmount);

  // If paid, update DB
  if (status.paid && status.txHash) {
    try {
      const link = await prisma.paymentLink.findUnique({
        where: { bchAddress: address },
      });

      if (link) {
        // Upsert transaction
        await prisma.transaction.upsert({
          where: { txHash: status.txHash },
          create: {
            paymentLinkId: link.id,
            txHash: status.txHash,
            amountBCH: status.amount,
            confirmations: status.confirmations,
          },
          update: {
            confirmations: status.confirmations,
          },
        });

        // Update link status
        if (link.status !== "paid") {
          await prisma.paymentLink.update({
            where: { id: link.id },
            data: { status: "paid" },
          });
        }
      }
    } catch (err) {
      console.error("DB update error:", err);
    }
  }

  return NextResponse.json(status);
}
