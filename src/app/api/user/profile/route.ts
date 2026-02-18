import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      paymentLinks: {
        include: { transactions: true },
        orderBy: { createdAt: "desc" },
      },
      developerApps: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const totalReceived = user.paymentLinks.reduce((sum, link) => {
    return sum + link.transactions.reduce((s, tx) => s + tx.amountBCH, 0);
  }, 0);

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      createdAt: user.createdAt,
    },
    stats: {
      totalLinks: user.paymentLinks.length,
      totalReceived,
      totalTransactions: user.paymentLinks.reduce(
        (sum, link) => sum + link.transactions.length,
        0
      ),
    },
    paymentLinks: user.paymentLinks.map((link) => ({
      id: link.id,
      linkName: link.linkName,
      title: link.title,
      description: link.description,
      amountBCH: link.amountBCH,
      bchAddress: link.bchAddress,
      status: link.status,
      createdAt: link.createdAt,
      transactions: link.transactions,
    })),
    developerApps: user.developerApps.map((app) => ({
      id: app.id,
      appName: app.appName,
      apiKey: app.apiKey,
      webhookUrl: app.webhookUrl,
    })),
  });
}
