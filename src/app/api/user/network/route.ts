import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { network } = await req.json();
  if (network !== "mainnet" && network !== "testnet") {
    return NextResponse.json({ error: "Invalid network" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: payload.userId },
    data: { network },
  });

  return NextResponse.json({ network: user.network });
}
