import * as bip39 from "bip39";
import { HDKey } from "@scure/bip32";
import { createHash } from "crypto";

export type Network = "mainnet" | "testnet";

// BIP44 coin types: 145 = BCH mainnet, 1 = testnet
const COIN_TYPE: Record<Network, number> = { mainnet: 145, testnet: 1 };

const CASHADDR_CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

function sha256(data: Buffer): Buffer {
  return createHash("sha256").update(data).digest();
}

function hash160(pubKey: Uint8Array): Buffer {
  const sha = createHash("sha256").update(pubKey).digest();
  return createHash("ripemd160").update(sha).digest();
}

function polymod(values: number[]): bigint {
  const generators: bigint[] = [
    0x98f2bc8e61n, 0x79b76d99e2n, 0xf33e5fb3c4n, 0xae2eabe2a8n, 0x1e4f43e470n,
  ];
  let chk = 1n;
  for (const value of values) {
    const top = chk >> 35n;
    chk = ((chk & 0x07ffffffffn) << 5n) ^ BigInt(value);
    for (let i = 0; i < 5; i++) {
      if ((top >> BigInt(i)) & 1n) chk ^= generators[i];
    }
  }
  return chk ^ 1n;
}

function createChecksum(prefix: string, payload: number[]): number[] {
  const prefixData = [...prefix].map((c) => c.charCodeAt(0) & 0x1f);
  const poly = polymod([...prefixData, 0, ...payload, 0, 0, 0, 0, 0, 0, 0, 0]);
  const result: number[] = [];
  for (let i = 0; i < 8; i++) {
    result.push(Number((poly >> BigInt(5 * (7 - i))) & 0x1fn));
  }
  return result;
}

function convertBits(data: number[], from: number, to: number, pad: boolean): number[] {
  let acc = 0, bits = 0;
  const result: number[] = [];
  const maxv = (1 << to) - 1;
  for (const value of data) {
    acc = (acc << from) | value;
    bits += from;
    while (bits >= to) {
      bits -= to;
      result.push((acc >> bits) & maxv);
    }
  }
  if (pad && bits > 0) result.push((acc << (to - bits)) & maxv);
  return result;
}

function encodeCashAddr(hash160Buf: Buffer, network: Network): string {
  const prefix = network === "mainnet" ? "bitcoincash" : "bchtest";
  const payload = convertBits([0x00, ...hash160Buf], 8, 5, true);
  const checksum = createChecksum(prefix, payload);
  return `${prefix}:${[...payload, ...checksum].map((v) => CASHADDR_CHARSET[v]).join("")}`;
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface Wallet {
  mnemonic: string;
  xpub: string;
}

export function generateWallet(): Wallet {
  const mnemonic = bip39.generateMnemonic(128);
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = HDKey.fromMasterSeed(seed);
  const accountNode = root.derive("m/44'/145'/0'");
  const xpub = accountNode.publicExtendedKey;
  return { mnemonic, xpub };
}

/** Derive a BCH receive address from the mnemonic at a given index */
export function deriveAddress(mnemonic: string, index: number, network: Network = "mainnet"): string {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = HDKey.fromMasterSeed(seed);
  const child = root.derive(`m/44'/${COIN_TYPE[network]}'/0'/0/${index}`);
  return encodeCashAddr(hash160(child.publicKey!), network);
}

/** Get the raw hex private key at a given derivation index */
export function getPrivateKeyHex(mnemonic: string, index: number, network: Network = "mainnet"): string {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = HDKey.fromMasterSeed(seed);
  const child = root.derive(`m/44'/${COIN_TYPE[network]}'/0'/0/${index}`);
  return Buffer.from(child.privateKey!).toString("hex");
}

export function formatBchUri(address: string, amount?: number | null): string {
  if (amount && amount > 0) return `${address}?amount=${amount}`;
  return address;
}

export function encryptMnemonic(mnemonic: string, secret: string): string {
  const key = sha256(Buffer.from(secret));
  const data = Buffer.from(mnemonic, "utf-8");
  const enc = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) enc[i] = data[i] ^ key[i % key.length];
  return enc.toString("base64");
}

export function decryptMnemonic(encrypted: string, secret: string): string {
  const key = sha256(Buffer.from(secret));
  const data = Buffer.from(encrypted, "base64");
  const dec = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) dec[i] = data[i] ^ key[i % key.length];
  return dec.toString("utf-8");
}
