export type LeaderboardEntry = {
  username: string;
  total_pnl: number;
  wins: number;
  losses: number;
  win_rate: number;
};

export interface LeaderboardProps {
  entries: LeaderboardEntry[];
  isLoading?: boolean;
  updatedAt?: string;
}