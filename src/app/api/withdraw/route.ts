import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { decryptMnemonic, getPrivateKeyHex, type Network } from "@/lib/bch-wallet";
import { getUtxos, buildTransaction, broadcastTransaction } from "@/lib/bch-tx";

export async function POST(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { toAddress } = await req.json();
    if (!toAddress) return NextResponse.json({ error: "toAddress is required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { paymentLinks: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const network = (user.network as Network) || "mainnet";
    const secret = process.env.MNEMONIC_SECRET || "cashdrop-mnemonic-secret";
    const mnemonic = decryptMnemonic(user.mnemonicEnc, secret);

    // Gather all UTXOs from all payment links on this network
    const linksOnNetwork = user.paymentLinks.filter((l) => l.network === network);
    if (linksOnNetwork.length === 0) {
      return NextResponse.json({ error: "No payment links on this network" }, { status: 400 });
    }

    const utxosWithKeys: Array<{
      txId: string;
      outputIndex: number;
      satoshis: number;
      address: string;
      privateKeyHex: string;
    }> = [];

    for (const link of linksOnNetwork) {
      const utxos = await getUtxos(link.bchAddress, network);
      if (utxos.length > 0) {
        const privKey = getPrivateKeyHex(mnemonic, link.derivationIndex, network);
        utxosWithKeys.push(...utxos.map((u) => ({ ...u, privateKeyHex: privKey })));
      }
    }

    if (utxosWithKeys.length === 0) {
      return NextResponse.json({ error: "No spendable balance found" }, { status: 400 });
    }

    const totalSatoshis = utxosWithKeys.reduce((s, u) => s + u.satoshis, 0);

    // Build and broadcast transaction
    const rawTx = await buildTransaction({
      utxos: utxosWithKeys,
      toAddress,
      feeSatoshis: 1000,
      network,
    });

    const txHash = await broadcastTransaction(rawTx, network);

    return NextResponse.json({
      success: true,
      txHash,
      amountBCH: (totalSatoshis - 1000) / 1e8,
      network,
      explorerUrl:
        network === "mainnet"
          ? `https://blockchair.com/bitcoin-cash/transaction/${txHash}`
          : `https://chipnet.imaginary.cash/tx/${txHash}`,
    });
  } catch (error) {
    console.error("Withdraw error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Withdrawal failed" },
      { status: 500 }
    );
  }
}
