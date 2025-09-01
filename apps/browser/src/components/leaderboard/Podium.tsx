import { Link } from 'react-router-dom';
import { Crown, Medal } from 'lucide-react';
import type { LeaderboardEntry } from './types';

interface PodiumProps {
  entries: LeaderboardEntry[];
}

export function Podium({ entries }: PodiumProps) {
  if (entries.length < 3) return null;

  const [first, second, third] = entries;
  
  return (
    <div className="relative w-full max-w-5xl mx-auto px-4">
      {/* Background shadow effect */}
      <div className="absolute inset-x-4 bottom-2 h-6 rounded-full bg-black/25 blur-xl" />
      
      {/* Podium layout */}
      <div className="flex items-end justify-center gap-3 sm:gap-6 md:gap-8 lg:gap-10 py-8">
        {/* Second Place */}
        <div className="translate-y-4 sm:translate-y-5 md:translate-y-6">
          <PodiumBlock rank={2} entry={second} height="h-32" />
        </div>

        {/* First Place */}
        <div className="-translate-y-1 sm:-translate-y-2">
          <PodiumBlock rank={1} entry={first} height="h-40" />
        </div>

        {/* Third Place */}
        <div className="translate-y-6 sm:translate-y-7 md:translate-y-8">
          <PodiumBlock rank={3} entry={third} height="h-28" />
        </div>
      </div>
    </div>
  );
}

interface PodiumBlockProps {
  rank: number;
  entry: LeaderboardEntry;
  height: string;
}

function PodiumBlock({ rank, entry, height }: PodiumBlockProps) {
  return (
    <div className="flex flex-col items-center w-full select-none">
      <div className="mb-4 flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-2">
          {rank === 1 && <Crown className="w-7 h-7 text-yellow-400" />}
          <Link 
            to={`/user/${entry.username}`}
            className="font-bold text-base md:text-lg hover:text-primary hover:underline transition-colors cursor-pointer"
          >
            {entry.username}
          </Link>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <div className={`text-sm font-semibold ${entry.total_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {entry.total_pnl >= 0 ? '+' : ''}{entry.total_pnl.toLocaleString('en-US', { 
              style: 'currency', 
              currency: 'USD' 
            })}
          </div>
          <div className="text-muted-foreground text-xs tabular-nums">
            {entry.win_rate.toFixed(1)}% Win Rate
          </div>
        </div>
      </div>

      <div className="relative w-20 md:w-24 lg:w-28" style={{ height: "200px" }}>
        {/* Visual treatments for the podium blocks */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[90%] h-3 rounded-t-md bg-white/5 shadow-md shadow-black/40" />
        <div className={`absolute inset-0 rounded-md bg-gradient-to-b ${
          rank === 1
            ? 'from-yellow-400 to-amber-500'
            : rank === 2
            ? 'from-slate-300 to-slate-400'
            : 'from-orange-400 to-orange-500'
        } border border-white/10 shadow-2xl shadow-black/40`} />
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-black/30 blur-lg" />
      </div>
      
      {/* Rank indicator */}
      <div className="pointer-events-none absolute -z-10 -mt-20 md:-mt-24 text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-foreground/10">
        #{rank}
      </div>
    </div>
  );
}