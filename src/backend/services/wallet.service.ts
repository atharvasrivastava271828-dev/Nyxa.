import fs from 'fs';
import path from 'path';

// Define Wallet structures
export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'purchase';
  amount: number;
  targetApiId?: string;
  targetTaskId?: string;
  targetAgentId?: string;
  description: string;
  createdAt: string;
}

export interface UserWallet {
  userId: string;
  balance: number;
  transactions: WalletTransaction[];
}

const WALLET_FILE_PATH = path.join(process.cwd(), 'database', 'wallets.json');

// Helper to ensure database folder and wallets file exists
function initWalletFile() {
  const dir = path.dirname(WALLET_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(WALLET_FILE_PATH)) {
    fs.writeFileSync(WALLET_FILE_PATH, JSON.stringify({}), 'utf8');
  }
}

// Read all wallets
function readWallets(): Record<string, UserWallet> {
  initWalletFile();
  try {
    const data = fs.readFileSync(WALLET_FILE_PATH, 'utf8');
    return JSON.parse(data || '{}');
  } catch (err) {
    console.error('[WalletService] Error reading wallets file:', err);
    return {};
  }
}

// Write wallets
function writeWallets(wallets: Record<string, UserWallet>) {
  initWalletFile();
  try {
    fs.writeFileSync(WALLET_FILE_PATH, JSON.stringify(wallets, null, 2), 'utf8');
  } catch (err) {
    console.error('[WalletService] Error writing wallets file:', err);
  }
}

/**
 * Gets the wallet for a user, creating one with $0.00 balance if it does not exist.
 */
export async function getWallet(userId: string): Promise<UserWallet> {
  const wallets = readWallets();
  if (!wallets[userId]) {
    wallets[userId] = {
      userId,
      balance: 0.00,
      transactions: []
    };
    writeWallets(wallets);
  }
  return wallets[userId];
}

/**
 * Deposits funds into the user's wallet.
 */
export async function depositFunds(userId: string, amount: number): Promise<{ balance: number; transaction: WalletTransaction }> {
  if (amount <= 0) {
    throw new Error('Deposit amount must be greater than zero.');
  }

  const wallets = readWallets();
  if (!wallets[userId]) {
    wallets[userId] = {
      userId,
      balance: 0.00,
      transactions: []
    };
  }

  const newBalance = parseFloat((wallets[userId].balance + amount).toFixed(2));
  
  const transaction: WalletTransaction = {
    id: `wtx_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type: 'deposit',
    amount,
    description: `Sandbox deposit: Added $${amount.toFixed(2)}`,
    createdAt: new Date().toISOString()
  };

  wallets[userId].balance = newBalance;
  wallets[userId].transactions.unshift(transaction); // Prepend so it's descending order

  writeWallets(wallets);
  return { balance: newBalance, transaction };
}

/**
 * Performs a purchase using wallet funds.
 */
export async function purchaseWithWallet(
  userId: string,
  payload: {
    targetApiId?: string;
    targetTaskId?: string;
    targetAgentId?: string;
    amount: number;
  }
): Promise<{ balance: number; transaction: WalletTransaction }> {
  const { targetApiId, targetTaskId, targetAgentId, amount } = payload;

  if (amount <= 0) {
    throw new Error('Purchase amount must be greater than zero.');
  }

  const wallets = readWallets();
  const wallet = wallets[userId];

  if (!wallet || wallet.balance < amount) {
    throw new Error('Insufficient wallet balance.');
  }

  const newBalance = parseFloat((wallet.balance - amount).toFixed(2));
  
  let targetType = 'Item';
  if (targetApiId) targetType = 'API';
  if (targetTaskId) targetType = 'Task';
  if (targetAgentId) targetType = 'Agent';

  const transaction: WalletTransaction = {
    id: `wtx_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type: 'purchase',
    amount,
    targetApiId,
    targetTaskId,
    targetAgentId,
    description: `Purchased ${targetType} (Cost: $${amount.toFixed(2)})`,
    createdAt: new Date().toISOString()
  };

  wallets[userId].balance = newBalance;
  wallets[userId].transactions.unshift(transaction);

  writeWallets(wallets);
  return { balance: newBalance, transaction };
}
