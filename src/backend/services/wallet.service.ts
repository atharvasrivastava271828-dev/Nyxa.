import fs from 'fs';
import path from 'path';
import { createAdminSupabaseClient } from '@/backend/lib/supabase-server';

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

// Read all wallets (fallback mode)
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

// Write wallets (fallback mode)
function writeWallets(wallets: Record<string, UserWallet>) {
  initWalletFile();
  try {
    fs.writeFileSync(WALLET_FILE_PATH, JSON.stringify(wallets, null, 2), 'utf8');
  } catch (err) {
    console.error('[WalletService] Error writing wallets file:', err);
  }
}

/**
 * Gets the wallet for a user, using Supabase as primary and local JSON as fallback.
 */
export async function getWallet(userId: string): Promise<UserWallet> {
  const supabase = createAdminSupabaseClient();
  
  try {
    // 1. Fetch wallet balance from Supabase
    const { data: walletData, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (walletError) throw walletError;

    // Initialize in Supabase if it doesn't exist
    let balance = 0;
    if (!walletData) {
      const { data: inserted, error: insertError } = await supabase
        .from('wallets')
        .insert({ user_id: userId, balance: 0.00 })
        .select()
        .single();
      
      if (!insertError && inserted) {
        balance = parseFloat(inserted.balance);
      }
    } else {
      balance = parseFloat(walletData.balance);
    }

    // 2. Fetch transaction logs from Supabase
    const { data: txData, error: txError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (txError) throw txError;

    const transactions: WalletTransaction[] = (txData || []).map(tx => ({
      id: tx.id,
      userId: tx.user_id,
      type: tx.type,
      amount: parseFloat(tx.amount),
      description: tx.description || '',
      createdAt: tx.created_at
    }));

    return { userId, balance, transactions };

  } catch (dbError) {
    console.warn('[WalletService] Database error or tables missing, using local JSON fallback:', dbError);
    
    // Fallback: Use Local JSON storage
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
}

/**
 * Deposits funds into the user's wallet.
 */
export async function depositFunds(userId: string, amount: number): Promise<{ balance: number; transaction: WalletTransaction }> {
  if (amount <= 0) {
    throw new Error('Deposit amount must be greater than zero.');
  }

  const supabase = createAdminSupabaseClient();
  const description = `Sandbox deposit: Added $${amount.toFixed(2)}`;

  try {
    // 1. Fetch current wallet to get balance
    const wallet = await getWallet(userId);
    const newBalance = parseFloat((wallet.balance + amount).toFixed(2));

    // 2. Update balance in Supabase
    const { error: walletError } = await supabase
      .from('wallets')
      .upsert({ user_id: userId, balance: newBalance, updated_at: new Date().toISOString() });

    if (walletError) throw walletError;

    // 3. Log transaction record in Supabase
    const { data: txData, error: txError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        type: 'deposit',
        amount,
        description
      })
      .select()
      .single();

    if (txError) throw txError;

    const transaction: WalletTransaction = {
      id: txData.id,
      userId,
      type: 'deposit',
      amount,
      description,
      createdAt: txData.created_at
    };

    return { balance: newBalance, transaction };

  } catch (dbError) {
    console.warn('[WalletService] Database error on deposit, performing local JSON fallback:', dbError);

    // Fallback logic
    const wallets = readWallets();
    if (!wallets[userId]) {
      wallets[userId] = { userId, balance: 0.00, transactions: [] };
    }

    const newBalance = parseFloat((wallets[userId].balance + amount).toFixed(2));
    const transaction: WalletTransaction = {
      id: `wtx_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'deposit',
      amount,
      description,
      createdAt: new Date().toISOString()
    };

    wallets[userId].balance = newBalance;
    wallets[userId].transactions.unshift(transaction);
    writeWallets(wallets);

    return { balance: newBalance, transaction };
  }
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

  const supabase = createAdminSupabaseClient();
  let targetType = 'Item';
  if (targetApiId) targetType = 'API';
  if (targetTaskId) targetType = 'Task';
  if (targetAgentId) targetType = 'Agent';

  const description = `Purchased ${targetType} (Cost: $${amount.toFixed(2)})`;

  try {
    // 1. Fetch current wallet
    const wallet = await getWallet(userId);
    if (wallet.balance < amount) {
      throw new Error('Insufficient wallet balance.');
    }

    const newBalance = parseFloat((wallet.balance - amount).toFixed(2));

    // 2. Update balance in Supabase
    const { error: walletError } = await supabase
      .from('wallets')
      .upsert({ user_id: userId, balance: newBalance, updated_at: new Date().toISOString() });

    if (walletError) throw walletError;

    // 3. Log transaction in Supabase
    const { data: txData, error: txError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        type: 'purchase',
        amount,
        description
      })
      .select()
      .single();

    if (txError) throw txError;

    const transaction: WalletTransaction = {
      id: txData.id,
      userId,
      type: 'purchase',
      amount,
      targetApiId,
      targetTaskId,
      targetAgentId,
      description,
      createdAt: txData.created_at
    };

    return { balance: newBalance, transaction };

  } catch (dbError) {
    console.warn('[WalletService] Database error on purchase, performing local JSON fallback:', dbError);

    // Fallback logic
    const wallets = readWallets();
    const wallet = wallets[userId];

    if (!wallet || wallet.balance < amount) {
      throw new Error('Insufficient wallet balance.');
    }

    const newBalance = parseFloat((wallet.balance - amount).toFixed(2));
    const transaction: WalletTransaction = {
      id: `wtx_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'purchase',
      amount,
      targetApiId,
      targetTaskId,
      targetAgentId,
      description,
      createdAt: new Date().toISOString()
    };

    wallets[userId].balance = newBalance;
    wallets[userId].transactions.unshift(transaction);
    writeWallets(wallets);

    return { balance: newBalance, transaction };
  }
}
