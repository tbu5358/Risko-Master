import { useState, useEffect, useMemo, useRef } from 'react';
import { Car, Crown, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// --- Types ---
interface BetEntry {
  id: string;
  game: string;
  gameIcon: React.ComponentType<{ className?: string }>;
  user: string;
  time: string;
  betAmount: number;
  multiplier: number;
  payout: number;
  isWin: boolean;
}

// --- Demo Data ---
const gameData = {
  SnakeRoyale: {
    icon: Crown,
    entries: [
      { user: "Hidden", isWin: true },
      { user: "ProGamer", isWin: false },
      { user: "Hidden", isWin: true },
      { user: "RoyalSnake", isWin: false },
      { user: "Hidden", isWin: true }
    ]
  },
  LastManStanding: {
    icon: Trophy,
    entries: [
      { user: "Hidden", isWin: false },
      { user: "Survivor99", isWin: true },
      { user: "Hidden", isWin: false },
      { user: "RoyalKing", isWin: true },
      { user: "Hidden", isWin: true }
    ]
  },
  SpeedChess: {
    icon: Car,
    entries: [
      { user: "Hidden", isWin: false },
      { user: "SpeedRacer", isWin: true },
      { user: "Hidden", isWin: false },
      { user: "TurboMax", isWin: true },
      { user: "Hidden", isWin: true }
    ]
  }
} as const;

const BET_AMOUNTS = [1, 5, 20] as const;

function getRandomTime() {
  const now = new Date();
  const minsAgo = Math.floor(Math.random() * 30);
  const time = new Date(now.getTime() - minsAgo * 60000);
  return time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getPayoutAndMultiplier(bet: number, isWin: boolean) {
  if (isWin) {
    const payout = bet * 100;
    return { payout, multiplier: 100 };
  } else {
    return { payout: -bet, multiplier: -1 };
  }
}

function generateBetEntry(poolIndex: number, flatPool: { game: keyof typeof gameData; i: number }[]): BetEntry {
  const { game, i } = flatPool[poolIndex % flatPool.length];
  const gameInfo = gameData[game];
  const base = gameInfo.entries[i % gameInfo.entries.length];
  const betAmount = BET_AMOUNTS[poolIndex % BET_AMOUNTS.length];
  const { payout, multiplier } = getPayoutAndMultiplier(betAmount, base.isWin);
  return {
    id: `${Date.now()}-${poolIndex}`,
    game: String(game),
    gameIcon: gameInfo.icon,
    user: base.user,
    time: getRandomTime(),
    betAmount,
    multiplier,
    payout,
    isWin: base.isWin
  };
}

const VISIBLE_ROWS = 6;
const ROW_HEIGHT = 56;
const NEW_ENTRY_MIN_MS = 4000;
const NEW_ENTRY_MAX_MS = 6000;
const SLIDE_DURATION_MS = 600;

const LiveBetsFeed = () => {
  const [entries, setEntries] = useState<BetEntry[]>([]);
  const [realWins, setRealWins] = useState<BetEntry[]>([]);
  const [realLosses, setRealLosses] = useState<BetEntry[]>([]);
  const [entryIndex, setEntryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [incomingEntry, setIncomingEntry] = useState<BetEntry | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [offsetY, setOffsetY] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const animationTimeoutRef = useRef<number | null>(null);

  const allGames = useMemo(() => Object.keys(gameData) as (keyof typeof gameData)[], []);
  const flatDemoPool = useMemo(() => {
    const pool: { game: keyof typeof gameData; i: number }[] = [];
    allGames.forEach((g) => {
      gameData[g].entries.forEach((_, i) => {
        pool.push({ game: g, i });
      });
    });
    return pool;
  }, [allGames]);

  // Initial population with visible rows
  useEffect(() => {
    const initial = Array.from({ length: VISIBLE_ROWS }, (_, i) => generateBetEntry(i, flatDemoPool));
    setEntries(initial);
    setEntryIndex(VISIBLE_ROWS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch recent real transactions and transform to entries
  useEffect(() => {
    let isMounted = true;
    const fetchReal = async () => {
      const { data, error } = await supabase.functions.invoke('recent-game-results');
      if (error || !data?.rows) return;
      const toEntry = (row: any): BetEntry | null => {
        const gameType = row?.matches?.game_type as string | undefined;
        const username = row?.users?.username as string | undefined;
        if (!gameType || !username) return null;
        const isWin = row.type === 'game_win';
        const payoutAbs = Math.max(0, Number(row.amount || 0));
        // Map game_type enum to display name and icon set
        let gameKey: keyof typeof gameData = 'SpeedChess';
        if (gameType === 'snakeroyale') gameKey = 'SnakeRoyale';
        else if (gameType === 'lastman') gameKey = 'LastManStanding';
        else gameKey = 'SpeedChess';
        const info = gameData[gameKey];
        // Derive a plausible bet/multiplier just for display when real stake unknown
        const betAmount = BET_AMOUNTS[Math.floor(Math.random() * BET_AMOUNTS.length)];
        const payout = isWin ? payoutAbs : -payoutAbs;
        const multiplier = isWin && betAmount > 0 ? Math.max(1, +(payoutAbs / betAmount).toFixed(2)) : -1;
        const createdAt = row.created_at ? new Date(row.created_at) : new Date();
        const time = createdAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return {
          id: row.id,
          game: String(gameKey),
          gameIcon: info.icon,
          user: username,
          time,
          betAmount,
          multiplier,
          payout,
          isWin,
        };
      };
      const entries = (data.rows as any[]).map(toEntry).filter(Boolean) as BetEntry[];
      if (!isMounted) return;
      setRealWins(entries.filter(e => e.isWin));
      setRealLosses(entries.filter(e => !e.isWin));
    };
    fetchReal();
    const refresh = setInterval(fetchReal, 60000);
    return () => {
      isMounted = false;
      clearInterval(refresh);
    };
  }, []);

  // Insert a new entry at the top every 4–6s with jitter: slide in from top, drop bottom
  useEffect(() => {
    const scheduleNext = () => {
      const delay = NEW_ENTRY_MIN_MS + Math.floor(Math.random() * (NEW_ENTRY_MAX_MS - NEW_ENTRY_MIN_MS));
      intervalRef.current = window.setTimeout(tick, delay) as unknown as number;
    };

    const tick = () => {
      // If paused or animating, just reschedule without changes
      if (isPaused || isAnimating) {
        scheduleNext();
        return;
      }

      // Weighted selection 75% wins, 25% losses, fallback to fake when none
      const preferWin = Math.random() < 0.75;
      let candidatePool: BetEntry[] | null = null;
      if (preferWin && realWins.length > 0) candidatePool = realWins;
      else if (!preferWin && realLosses.length > 0) candidatePool = realLosses;
      else if (realWins.length > 0 || realLosses.length > 0) {
        candidatePool = (realWins.length > 0 ? realWins : realLosses);
      }
      const newEntry = candidatePool
        ? candidatePool[Math.floor(Math.random() * candidatePool.length)]
        : generateBetEntry(entryIndex, flatDemoPool);

      setIncomingEntry(newEntry);
      setIsAnimating(true);
      setOffsetY(-ROW_HEIGHT);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setOffsetY(0));
      });
      animationTimeoutRef.current = window.setTimeout(() => {
        setEntries((prev) => [newEntry, ...prev].slice(0, VISIBLE_ROWS));
        setIncomingEntry(null);
        setIsAnimating(false);
        setEntryIndex((prev) => prev + 1);
        scheduleNext();
      }, SLIDE_DURATION_MS);
    };

    scheduleNext();
    return () => {
      if (intervalRef.current) window.clearTimeout(intervalRef.current);
      if (animationTimeoutRef.current) window.clearTimeout(animationTimeoutRef.current);
    };
  }, [entryIndex, isPaused, isAnimating, flatDemoPool, realWins, realLosses]);

  const formatCurrency = (amount: number) => {
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    if (absAmount >= 1000000) return `${isNegative ? '-' : ''}$${(absAmount / 1000000).toFixed(2)}M`;
    if (absAmount >= 1000) return `${isNegative ? '-' : ''}$${(absAmount / 1000).toFixed(2)}K`;
    return `${isNegative ? '-' : ''}$${absAmount.toFixed(2)}`;
  };

  const displayEntries = incomingEntry ? [incomingEntry, ...entries] : entries;

  return (
    <section className="py-8 bg-gradient-to-r from-background/50 to-card/30">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-foreground">Live Games</h2>
        </div>
        <div
          className="bg-card/50 border border-border/30 rounded-lg overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-muted/30 border-b border-border/20 text-sm font-medium text-muted-foreground">
            <div className="lg:col-span-1">Game</div>
            <div className="hidden lg:block">User</div>
            <div className="hidden lg:block">Time</div>
            <div>Entry Fee</div>
            <div className="hidden lg:block">Multiplier</div>
            <div>Payout</div>
          </div>

          <div className="relative overflow-hidden" style={{ height: `${VISIBLE_ROWS * ROW_HEIGHT}px` }}>
            {/* Top and bottom gradient fades for a professional look */}
            <div className="pointer-events-none absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-card/80 to-transparent z-10" />
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-card/80 to-transparent z-10" />

            <div
              className={`will-change-transform ${isAnimating ? 'transition-transform duration-500 ease-out' : ''}`}
              style={{ transform: `translateY(${offsetY}px)` }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {displayEntries.map((entry) => {
                const GameIcon = entry.gameIcon;
                return (
                  <div
                    key={entry.id}
                    className="grid grid-cols-3 lg:grid-cols-6 gap-4 p-4 hover:bg-muted/20 transition-colors duration-200 text-sm border-b border-border/10"
                    style={{ height: ROW_HEIGHT }}
                  >
                    <div className="flex items-center gap-2 lg:col-span-1">
                      <GameIcon className="w-4 h-4 text-primary" />
                      <span className="hidden sm:inline text-foreground font-medium">{entry.game}</span>
                    </div>
                    <div className="hidden lg:flex items-center gap-2">
                      <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-xs">👤</span>
                      </div>
                      <span className="text-muted-foreground">{entry.user}</span>
                    </div>
                    <div className="hidden lg:block text-muted-foreground">{entry.time}</div>
                    <div className="flex flex-col lg:block">
                      <span className="text-foreground font-medium">{formatCurrency(entry.betAmount)}</span>
                      <span className="lg:hidden text-xs text-muted-foreground">{entry.user} • {entry.time}</span>
                    </div>
                    <div className="hidden lg:block">
                      <span className={entry.multiplier > 0 ? 'text-foreground' : 'text-muted-foreground'}>
                        {Number.isFinite(entry.multiplier) ? entry.multiplier.toFixed(2) : '0.00'}x
                      </span>
                    </div>
                    <div className="flex flex-col lg:block">
                      <span className={`font-medium ${entry.isWin ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(entry.payout)}</span>
                      <span className="lg:hidden text-xs text-muted-foreground">{entry.multiplier.toFixed(2)}x multiplier</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveBetsFeed;
