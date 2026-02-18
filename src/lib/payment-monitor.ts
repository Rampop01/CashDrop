const BLOCKCHAIR_API = "https://api.blockchair.com/bitcoin-cash";

interface BlockchairAddressData {
  balance: number;
  received: number;
  transaction_count: number;
}

interface BlockchairTransaction {
  hash: string;
  balance_change: number;
  block_id: number;
  time: string;
}

export async function checkAddressBalance(address: string): Promise<{
  balance: number;
  received: number;
  txCount: number;
}> {
  // Strip prefix for API query
  const cleanAddress = address.replace("bitcoincash:", "");

  try {
    const res = await fetch(
      `${BLOCKCHAIR_API}/dashboards/address/${cleanAddress}`,
      { next: { revalidate: 30 } }
    );

    if (!res.ok) {
      throw new Error(`Blockchair API error: ${res.status}`);
    }

    const data = await res.json();
    const addrData = data.data?.[cleanAddress]?.address as BlockchairAddressData;

    if (!addrData) {
      return { balance: 0, received: 0, txCount: 0 };
    }

    return {
      balance: addrData.balance / 1e8, // satoshis to BCH
      received: addrData.received / 1e8,
      txCount: addrData.transaction_count,
    };
  } catch {
    return { balance: 0, received: 0, txCount: 0 };
  }
}

export async function getAddressTransactions(address: string): Promise<
  Array<{
    hash: string;
    amount: number;
    blockHeight: number;
    time: string;
  }>
> {
  const cleanAddress = address.replace("bitcoincash:", "");

  try {
    const res = await fetch(
      `${BLOCKCHAIR_API}/dashboards/address/${cleanAddress}?limit=10`,
      { next: { revalidate: 30 } }
    );

    if (!res.ok) return [];

    const data = await res.json();
    const transactions =
      (data.data?.[cleanAddress]?.transactions as BlockchairTransaction[]) || [];

    return transactions
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
  expectedAmount?: number
): Promise<{
  paid: boolean;
  amount: number;
  txHash?: string;
  confirmations: number;
}> {
  const { balance, txCount } = await checkAddressBalance(address);

  if (txCount === 0) {
    return { paid: false, amount: 0, confirmations: 0 };
  }

  const transactions = await getAddressTransactions(address);

  if (transactions.length === 0) {
    return { paid: false, amount: 0, confirmations: 0 };
  }

  const latestTx = transactions[0];
  const paid = expectedAmount ? balance >= expectedAmount : balance > 0;

  // Estimate confirmations from block height
  let confirmations = 0;
  if (latestTx.blockHeight > 0) {
    try {
      const statsRes = await fetch(`${BLOCKCHAIR_API}/stats`, {
        next: { revalidate: 60 },
      });
      if (statsRes.ok) {
        const stats = await statsRes.json();
        const currentBlock = stats.data?.best_block_height || 0;
        confirmations = currentBlock - latestTx.blockHeight + 1;
      }
    } catch {
      confirmations = 1;
    }
  }

  return {
    paid,
    amount: latestTx.amount,
    txHash: latestTx.hash,
    confirmations,
  };
}
