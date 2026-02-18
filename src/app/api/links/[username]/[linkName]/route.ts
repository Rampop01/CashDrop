import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string; linkName: string }> }
) {
  const { username, linkName } = await params;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const link = await prisma.paymentLink.findUnique({
    where: { userId_linkName: { userId: user.id, linkName } },
  });

  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      username: user.username,
      displayName: user.displayName,
    },
    link: {
      linkName: link.linkName,
      title: link.title,
      description: link.description,
      amountBCH: link.amountBCH,
      bchAddress: link.bchAddress,
      status: link.status,
    },
  });
}
