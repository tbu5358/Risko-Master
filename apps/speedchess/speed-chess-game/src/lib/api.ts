export type LeaderboardEntry = {
  username: string;
  total_pnl: number;
  wins: number;
  losses: number;
  win_rate: number;
};

const SERVICE_BASE_URL = import.meta.env.VITE_SPEEDCHESS_SERVICE_URL || 'http://localhost:8081';

export async function fetchLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const url = new URL('/api/leaderboard', SERVICE_BASE_URL);
  url.searchParams.set('limit', String(limit));
  const res = await fetch(url.toString(), { credentials: 'include' });
  if (!res.ok) throw new Error(`Leaderboard request failed: ${res.status}`);
  const payload = await res.json();
  return payload?.data ?? payload ?? [];
}

export type BalanceResponse = { balance: string | number };
export async function fetchBalance(userId?: string): Promise<number> {
  const url = new URL('/api/balance', SERVICE_BASE_URL);
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(userId ? { user_id: userId } : {}),
  });
  if (!res.ok) throw new Error(`Balance request failed: ${res.status}`);
  const payload = await res.json();
  const data: BalanceResponse = payload?.data ?? payload;
  const value = typeof data?.balance === 'string' ? Number(data.balance) : Number(data?.balance ?? 0);
  return isFinite(value) ? value : 0;
}

export type ProfileStats = { username: string; wins: number; losses: number; win_rate: number; total_pnl: number };
export async function fetchProfileStats(username: string): Promise<ProfileStats> {
  const url = new URL('/api/profile', SERVICE_BASE_URL);
  url.searchParams.set('username', username);
  const res = await fetch(url.toString(), { credentials: 'include' });
  if (!res.ok) throw new Error(`Profile request failed: ${res.status}`);
  const payload = await res.json();
  return payload?.data ?? payload;
}
