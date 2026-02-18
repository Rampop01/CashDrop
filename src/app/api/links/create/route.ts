import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { deriveAddress } from "@/lib/bch-wallet";

export async function POST(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { linkName, title, description, amountBCH } = await req.json();

    if (!linkName || !title) {
      return NextResponse.json(
        { error: "linkName and title are required" },
        { status: 400 }
      );
    }

    const linkNameRegex = /^[a-z0-9_-]{1,30}$/;
    if (!linkNameRegex.test(linkName)) {
      return NextResponse.json(
        { error: "linkName must be 1-30 chars, lowercase letters, numbers, hyphens, underscores" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if link name already taken for this user
    const existingLink = await prisma.paymentLink.findUnique({
      where: { userId_linkName: { userId: user.id, linkName } },
    });
    if (existingLink) {
      return NextResponse.json({ error: "Link name already taken" }, { status: 409 });
    }

    // Derive new BCH address
    const derivationIndex = user.nextIndex;
    const bchAddress = deriveAddress(user.xpub, derivationIndex);

    // Create link and increment index atomically
    const [link] = await prisma.$transaction([
      prisma.paymentLink.create({
        data: {
          userId: user.id,
          linkName,
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
      link: {
        id: link.id,
        linkName: link.linkName,
        title: link.title,
        description: link.description,
        amountBCH: link.amountBCH,
        bchAddress: link.bchAddress,
        paymentUrl: `/${user.username}/${link.linkName}`,
        status: link.status,
      },
    });
  } catch (error) {
    console.error("Create link error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
