import type { Network } from "./bch-wallet";

const BLOCKCHAIR_BASE: Record<Network, string> = {
  mainnet: "https://api.blockchair.com/bitcoin-cash",
  testnet: "https://api.blockchair.com/bitcoin-cash/testnet",
};

function cleanAddress(address: string): string {
  return address.replace(/^(bitcoincash:|bchtest:)/, "");
}

export async function checkAddressBalance(
  address: string,
  network: Network = "mainnet"
): Promise<{ balance: number; received: number; txCount: number }> {
  const clean = cleanAddress(address);
  const base = BLOCKCHAIR_BASE[network];
  try {
    const res = await fetch(`${base}/dashboards/address/${clean}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return { balance: 0, received: 0, txCount: 0 };
    const data = await res.json();
    const addr = data.data?.[clean]?.address;
    if (!addr) return { balance: 0, received: 0, txCount: 0 };
    return {
      balance: addr.balance / 1e8,
      received: addr.received / 1e8,
      txCount: addr.transaction_count,
    };
  } catch {
    return { balance: 0, received: 0, txCount: 0 };
  }
}

export async function getAddressTransactions(
  address: string,
  network: Network = "mainnet"
): Promise<Array<{ hash: string; amount: number; blockHeight: number; time: string }>> {
  const clean = cleanAddress(address);
  const base = BLOCKCHAIR_BASE[network];
  try {
    const res = await fetch(`${base}/dashboards/address/${clean}?limit=10`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const txs: Array<{ hash: string; balance_change: number; block_id: number; time: string }> =
      data.data?.[clean]?.transactions ?? [];
    return txs
      .filter((tx) => tx.balance_change > 0)
      .map((tx) => ({
        hash: tx.hash,
        amount: tx.balance_change / 1e8,
        blockHeight: tx.block_id,
        time: tx.time,
      }));
  } catch {
    return [];
  }
}

export async function checkPaymentStatus(
  address: string,
  expectedAmount?: number,
  network: Network = "mainnet"
): Promise<{ paid: boolean; amount: number; txHash?: string; confirmations: number }> {
  const { balance, txCount } = await checkAddressBalance(address, network);
  if (txCount === 0) return { paid: false, amount: 0, confirmations: 0 };

  const txs = await getAddressTransactions(address, network);
  if (txs.length === 0) return { paid: false, amount: 0, confirmations: 0 };

  const latest = txs[0];
  const paid = expectedAmount ? balance >= expectedAmount : balance > 0;

  let confirmations = 0;
  if (latest.blockHeight > 0) {
    try {
      const statsRes = await fetch(`${BLOCKCHAIR_BASE[network]}/stats`, {
        next: { revalidate: 60 },
      });
      if (statsRes.ok) {
        const stats = await statsRes.json();
        confirmations = (stats.data?.best_block_height ?? 0) - latest.blockHeight + 1;
      }
    } catch {
      confirmations = 1;
    }
  }

  return { paid, amount: latest.amount, txHash: latest.hash, confirmations };
}
