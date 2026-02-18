import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const links = await prisma.paymentLink.findMany({
    where: { userId: payload.userId },
    include: { transactions: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    links: links.map((link) => ({
      id: link.id,
      linkName: link.linkName,
      title: link.title,
      description: link.description,
      amountBCH: link.amountBCH,
      bchAddress: link.bchAddress,
      status: link.status,
      createdAt: link.createdAt,
      totalReceived: link.transactions.reduce((s, tx) => s + tx.amountBCH, 0),
      transactionCount: link.transactions.length,
    })),
  });
}
