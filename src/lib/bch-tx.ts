import type { Network } from "./bch-wallet";

const BLOCKCHAIR_BASE: Record<Network, string> = {
  mainnet: "https://api.blockchair.com/bitcoin-cash",
  testnet: "https://api.blockchair.com/bitcoin-cash/testnet",
};

// ── UTXO fetching ─────────────────────────────────────────────────────────────

export interface Utxo {
  txId: string;
  outputIndex: number;
  satoshis: number;
  address: string;
}

export async function getUtxos(address: string, network: Network): Promise<Utxo[]> {
  const clean = address.replace(/^(bitcoincash:|bchtest:)/, "");
  const base = BLOCKCHAIR_BASE[network];
  const res = await fetch(`${base}/dashboards/address/${clean}?transaction_details=true`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  const utxos: Array<{ transaction_hash: string; index: number; value: number }> =
    data?.data?.[clean]?.utxo ?? [];
  return utxos.map((u) => ({
    txId: u.transaction_hash,
    outputIndex: u.index,
    satoshis: u.value,
    address,
  }));
}

export async function getTotalBalance(addresses: string[], network: Network): Promise<number> {
  let total = 0;
  for (const addr of addresses) {
    const utxos = await getUtxos(addr, network);
    total += utxos.reduce((s, u) => s + u.satoshis, 0);
  }
  return total;
}

// ── Transaction building (P2PKH, BIP143 BCH sighash) ─────────────────────────

function writeVarInt(n: number): Buffer {
  if (n < 0xfd) return Buffer.from([n]);
  if (n <= 0xffff) {
    const b = Buffer.alloc(3);
    b[0] = 0xfd;
    b.writeUInt16LE(n, 1);
    return b;
  }
  const b = Buffer.alloc(5);
  b[0] = 0xfe;
  b.writeUInt32LE(n, 1);
  return b;
}

function writeLE32(n: number): Buffer {
  const b = Buffer.alloc(4);
  b.writeInt32LE(n, 0);
  return b;
}

function writeLE64(n: number): Buffer {
  const b = Buffer.alloc(8);
  b.writeBigInt64LE(BigInt(n), 0);
  return b;
}

function hash256(data: Buffer): Buffer {
  const { createHash } = require("crypto") as typeof import("crypto");
  return createHash("sha256").update(createHash("sha256").update(data).digest()).digest();
}

function p2pkhScript(hash160Buf: Buffer): Buffer {
  // OP_DUP OP_HASH160 <hash> OP_EQUALVERIFY OP_CHECKSIG
  return Buffer.concat([
    Buffer.from([0x76, 0xa9, 0x14]),
    hash160Buf,
    Buffer.from([0x88, 0xac]),
  ]);
}

function hash160FromAddress(address: string): Buffer {
  // Decode CashAddr → extract hash160 payload
  const { createHash } = require("crypto") as typeof import("crypto");
  const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
  const clean = address.includes(":") ? address.split(":")[1] : address;
  const values = [...clean].map((c) => CHARSET.indexOf(c));
  // Remove last 8 checksum chars
  const payload5bit = values.slice(0, -8);
  // Convert 5-bit to 8-bit
  let acc = 0, bits = 0;
  const result: number[] = [];
  for (const v of payload5bit.slice(1)) { // skip version byte
    acc = (acc << 5) | v;
    bits += 5;
    while (bits >= 8) {
      bits -= 8;
      result.push((acc >> bits) & 0xff);
    }
  }
  return Buffer.from(result.slice(0, 20));
}

/** Build, sign and serialize a BCH P2PKH transaction using BIP143 sighash */
export async function buildTransaction(params: {
  utxos: Array<Utxo & { privateKeyHex: string }>;
  toAddress: string;
  feeSatoshis?: number;
  network: Network;
}): Promise<string> {
  // Use bitcore-lib-cash for reliable transaction building
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const bitcore = require("bitcore-lib-cash");

  if (params.network === "testnet") {
    bitcore.Networks.defaultNetwork = bitcore.Networks.testnet;
  } else {
    bitcore.Networks.defaultNetwork = bitcore.Networks.mainnet;
  }

  const totalIn = params.utxos.reduce((s, u) => s + u.satoshis, 0);
  const fee = params.feeSatoshis ?? 1000;
  const sendAmount = totalIn - fee;

  if (sendAmount <= 0) throw new Error("Insufficient balance to cover fee");

  const utxoObjects = params.utxos.map((u) => ({
    txId: u.txId,
    outputIndex: u.outputIndex,
    address: u.address,
    script: bitcore.Script.buildPublicKeyHashOut(
      new bitcore.Address(u.address)
    ).toHex(),
    satoshis: u.satoshis,
  }));

  const privateKeys = [...new Set(params.utxos.map((u) => u.privateKeyHex))].map(
    (hex) => new bitcore.PrivateKey(hex, params.network === "testnet" ? bitcore.Networks.testnet : bitcore.Networks.mainnet)
  );

  const tx = new bitcore.Transaction()
    .from(utxoObjects)
    .to(params.toAddress, sendAmount)
    .sign(privateKeys);

  return tx.serialize();
}

// ── Broadcast ─────────────────────────────────────────────────────────────────

export async function broadcastTransaction(rawHex: string, network: Network): Promise<string> {
  const base = BLOCKCHAIR_BASE[network];
  const res = await fetch(`${base}/push/transaction`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${rawHex}`,
  });

  const data = await res.json();

  if (!res.ok || data.context?.error) {
    throw new Error(data.context?.error || "Broadcast failed");
  }

  return data.data?.transaction_hash ?? rawHex.slice(0, 64);
}
