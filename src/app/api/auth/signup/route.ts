import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { generateWallet, encryptMnemonic } from "@/lib/bch-wallet";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, displayName } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate username format
    const usernameRegex = /^[a-z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters, lowercase letters, numbers, hyphens, underscores" },
        { status: 400 }
      );
    }

    // Check uniqueness
    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: existing.username === username ? "Username taken" : "Email already registered" },
        { status: 409 }
      );
    }

    // Generate BCH wallet
    const wallet = generateWallet();
    const passwordHash = await hashPassword(password);
    const secret = process.env.MNEMONIC_SECRET || "cashdrop-mnemonic-secret";
    const mnemonicEnc = encryptMnemonic(wallet.mnemonic, secret);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        displayName: displayName || username,
        passwordHash,
        xpub: wallet.xpub,
        mnemonicEnc,
      },
    });

    const token = signToken({ userId: user.id, username: user.username });

    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
      },
      token,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
