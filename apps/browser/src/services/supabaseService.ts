import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  username: string;
  roles: string[];
}

export interface WalletBalance {
  user_id: string;
  balance: number;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdraw' | 'internal_credit' | 'internal_debit' | 'house_fee' | 'game_win' | 'game_loss' | 'fee';
  amount: number;
  tx_ref?: string;
  description?: string;
  created_at: string;
  status: 'pending' | 'complete' | 'failed';
  currency: string;
}

export interface MatchHistory {
  id: string;
  user_id: string;
  game_type: 'slither' | 'surviv' | 'poker' | 'blackjack';
  result: 'win' | 'loss' | 'draw';
  pnl: number;
  played_at: string;
}

// Auth functions
export const signUp = async (email: string, password: string, username: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: `${window.location.origin}/`
    }
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Profile functions
export const getUserProfile = async (_userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase.functions.invoke('user-profile-get');
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  if (!data) return null;
  return {
    id: data.id,
    username: data.username,
    roles: Array.isArray(data.roles) ? data.roles : [data.roles || 'user']
  };
};

export const updateUserProfile = async (userId: string, updates: { username?: string }) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select('id, username, roles')
    .single();
  
  return { data, error };
};

// Wallet functions
export const getWalletBalance = async (_userId: string): Promise<number> => {
  const { data, error } = await supabase.functions.invoke('wallet-balance-get');
  if (error) {
    console.error('Error fetching wallet balance:', error);
    return 0;
  }
  if (!data) return 0;
  return Number(data.balance || 0) / 100;
};

export const creditWallet = async (amount: number, description?: string, txRef?: string) => {
  const { data, error } = await supabase.functions.invoke('transactions-internal-credit', {
    body: { amount, description, tx_ref: txRef }
  });
  
  return { data, error };
};

export const debitWallet = async (amount: number, description?: string, txRef?: string) => {
  const { data, error } = await supabase.functions.invoke('transactions-internal-debit', {
    body: { amount, description, tx_ref: txRef }
  });
  
  return { data, error };
};

// Transaction functions
export const getTransactionHistory = async (userId: string, limit = 50): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }
  
  return data;
};

// Simplified functions for current schema
export const getTransactionHistorySimple = async (userId: string) => {
  return [];
};

// Real-time subscriptions
export const subscribeToWalletChanges = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('wallet-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'wallets',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};

export const subscribeToTransactions = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('transaction-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};