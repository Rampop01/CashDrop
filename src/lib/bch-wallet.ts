import * as bip39 from "bip39";
import { createHash } from "crypto";

// Bitcoin Cash uses a modified BIP44 path: m/44'/145'/0'/0/index
// We implement a simplified HD wallet using BIP39 mnemonic + deterministic derivation

// Simple hash-based address derivation from xpub + index
// In production, you'd use full BIP32 derivation with secp256k1
function sha256(data: string): Buffer {
  return createHash("sha256").update(data).digest();
}

function ripemd160(data: Buffer): Buffer {
  return createHash("ripemd160").update(data).digest();
}

// Base58Check encoding for Bitcoin Cash legacy addresses
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function base58Encode(buffer: Buffer): string {
  const digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    let carry = buffer[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let result = "";
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    result += "1";
  }
  for (let i = digits.length - 1; i >= 0; i--) {
    result += BASE58_ALPHABET[digits[i]];
  }
  return result;
}

function base58Check(payload: Buffer): string {
  const checksum = sha256(sha256(payload.toString("hex")).toString("hex"));
  const checksumBuf = createHash("sha256")
    .update(createHash("sha256").update(payload).digest())
    .digest();
  const full = Buffer.concat([payload, checksumBuf.subarray(0, 4)]);
  return base58Encode(full);
}

// CashAddr encoding for Bitcoin Cash
const CASHADDR_CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

function polymod(values: number[]): bigint {
  const generators: bigint[] = [
    0x98f2bc8e61n,
    0x79b76d99e2n,
    0xf33e5fb3c4n,
    0xae2eabe2a8n,
    0x1e4f43e470n,
  ];
  let chk = 1n;
  for (const value of values) {
    const top = chk >> 35n;
    chk = ((chk & 0x07ffffffffn) << 5n) ^ BigInt(value);
    for (let i = 0; i < 5; i++) {
      if ((top >> BigInt(i)) & 1n) {
        chk ^= generators[i];
      }
    }
  }
  return chk ^ 1n;
}

function createCashAddrChecksum(prefix: string, payload: number[]): number[] {
  const prefixData = [...prefix].map((c) => c.charCodeAt(0) & 0x1f);
  const values = [...prefixData, 0, ...payload, 0, 0, 0, 0, 0, 0, 0, 0];
  const poly = polymod(values);
  const result: number[] = [];
  for (let i = 0; i < 8; i++) {
    result.push(Number((poly >> BigInt(5 * (7 - i))) & 0x1fn));
  }
  return result;
}

function convertBits(data: number[], fromBits: number, toBits: number, pad: boolean): number[] {
  let acc = 0;
  let bits = 0;
  const result: number[] = [];
  const maxv = (1 << toBits) - 1;
  for (const value of data) {
    acc = (acc << fromBits) | value;
    bits += fromBits;
    while (bits >= toBits) {
      bits -= toBits;
      result.push((acc >> bits) & maxv);
    }
  }
  if (pad) {
    if (bits > 0) {
      result.push((acc << (toBits - bits)) & maxv);
    }
  }
  return result;
}

function toCashAddress(hash160: Buffer): string {
  const prefix = "bitcoincash";
  // Version byte: 0x00 for P2PKH (type=0, hash_size=0 for 20 bytes)
  const versionByte = 0x00;
  const payload = convertBits([versionByte, ...hash160], 8, 5, true);
  const checksum = createCashAddrChecksum(prefix, payload);
  const combined = [...payload, ...checksum];
  const encoded = combined.map((v) => CASHADDR_CHARSET[v]).join("");
  return `${prefix}:${encoded}`;
}

export interface Wallet {
  mnemonic: string;
  xpub: string; // We use a seed-derived key as our "xpub"
}

export function generateWallet(): Wallet {
  const mnemonic = bip39.generateMnemonic(128); // 12 words
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  // Use the first 64 bytes of seed hex as our master key identifier
  const xpub = sha256(seed.toString("hex")).toString("hex");

  return { mnemonic, xpub };
}

export function deriveAddress(xpub: string, index: number): string {
  // Deterministic address derivation: hash(xpub + index) -> hash160 -> cashaddr
  const combined = `${xpub}:${index}`;
  const pubKeyHash = sha256(combined);
  const hash160 = ripemd160(pubKeyHash);
  return toCashAddress(hash160);
}

export function formatBchUri(address: string, amount?: number): string {
  if (amount && amount > 0) {
    return `${address}?amount=${amount}`;
  }
  return address;
}

// Simple encryption for mnemonic storage (use proper KMS in production)
export function encryptMnemonic(mnemonic: string, secret: string): string {
  const key = sha256(secret);
  const data = Buffer.from(mnemonic, "utf-8");
  const encrypted = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    encrypted[i] = data[i] ^ key[i % key.length];
  }
  return encrypted.toString("base64");
}

export function decryptMnemonic(encrypted: string, secret: string): string {
  const key = sha256(secret);
  const data = Buffer.from(encrypted, "base64");
  const decrypted = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    decrypted[i] = data[i] ^ key[i % key.length];
  }
  return decrypted.toString("utf-8");
}
