import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deriveAddress } from "@/lib/bch-wallet";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "API key required" }, { status: 401 });
  }

  const devApp = await prisma.developerApp.findUnique({
    where: { apiKey },
    include: { user: true },
  });

  if (!devApp) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  try {
    const { linkName, title, description, amountBCH } = await req.json();

    if (!linkName || !title) {
      return NextResponse.json(
        { error: "linkName and title are required" },
        { status: 400 }
      );
    }

    const user = devApp.user;
    const derivationIndex = user.nextIndex;
    const bchAddress = deriveAddress(user.xpub, derivationIndex);

    const [link] = await prisma.$transaction([
      prisma.paymentLink.create({
        data: {
          userId: user.id,
          linkName: `${linkName}-${Date.now()}`,
          title,
          description: description || "",
          amountBCH: amountBCH || null,
          bchAddress,
          derivationIndex,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { nextIndex: derivationIndex + 1 },
      }),
    ]);

    return NextResponse.json({
      paymentLink: `/${user.username}/${link.linkName}`,
      bchAddress: link.bchAddress,
      linkId: link.id,
    });
  } catch (error) {
    console.error("Dev create-link error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
