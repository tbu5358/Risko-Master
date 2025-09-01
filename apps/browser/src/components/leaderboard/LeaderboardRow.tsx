import { Link } from 'react-router-dom';
import type { LeaderboardEntry } from './types';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  rank: number;
}

export function LeaderboardRow({ entry, rank }: LeaderboardRowProps) {
  return (
    <div className="grid grid-cols-12 px-4 py-3 hover:bg-muted/30 transition-colors">
      <div className="col-span-1 font-mono text-muted-foreground">
        #{rank}
      </div>
      <div className="col-span-5 md:col-span-6">
        <Link 
          to={`/user/${entry.username}`}
          className="font-medium hover:text-primary hover:underline transition-colors"
        >
          {entry.username}
        </Link>
      </div>
      <div className="col-span-3 md:col-span-2 text-right tabular-nums">
        <span className={entry.total_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>
          {entry.total_pnl >= 0 ? '+' : ''}{entry.total_pnl.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
          })}
        </span>
      </div>
      <div className="col-span-3 md:col-span-3 text-right tabular-nums">
        <span className="text-muted-foreground">{entry.win_rate.toFixed(1)}%</span>
        <span className="text-xs text-muted-foreground ml-1">
          ({entry.wins}/{entry.wins + entry.losses})
        </span>
      </div>
    </div>
  );
}