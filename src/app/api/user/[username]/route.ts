import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      paymentLinks: {
        where: { status: "pending" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    username: user.username,
    displayName: user.displayName,
    links: user.paymentLinks.map((link) => ({
      linkName: link.linkName,
      title: link.title,
      description: link.description,
      amountBCH: link.amountBCH,
    })),
  });
}
