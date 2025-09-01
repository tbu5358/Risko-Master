import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TopNavbar } from '@/components/TopNavbar';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { Calendar, Plus, Wallet, Settings, Crown, ThumbsDown, Percent, Award, ArrowDownCircle, ArrowUpCircle, Receipt, Trophy, Star, Flame, Rocket, Leaf } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PnLChart } from '@/components/PnLChart';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserGameStats, fetchUserGameHistory, fetchUserRoyalePlacements, type GameHistory, type GameStat, type RoyalePlacement } from '@/data/profile';

const UserProfile = () => {
  // All hooks at the very top
  const { username } = useParams<{ username: string }>();
  const [showSettings, setShowSettings] = useState(false);
  const [gameFilter, setGameFilter] = useState('All');
  const [gamePage, setGamePage] = useState(1);
  const [pnlRange, setPnlRange] = useState<'7D' | '30D' | '90D' | 'ALL'>('30D');
  const PAGE_SIZE = 6;
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [isNewbie, setIsNewbie] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<GameStat[]>([]);
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [placements, setPlacements] = useState<RoyalePlacement[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load user data based on username
  useEffect(() => {
    const loadUserData = async () => {
      if (!username) {
        setError('Username not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch user by username (case-insensitive) via Edge Function
        const { data: userProfile, error: userError } = await supabase
          .functions.invoke('user-by-username-get', { body: { username } });
        console.log('UserProfile fetch:', { username, userProfile, userError });

        if (userError || !userProfile) {
          setError('User not found');
          setLoading(false);
          return;
        }

        setUserData(userProfile);

        // Fetch member since date
        const created = new Date(userProfile.created_at);
        const formatted = `${String(created.getDate()).padStart(2, '0')}/${String(created.getMonth() + 1).padStart(2, '0')}/${created.getFullYear()}`;
        setMemberSince(formatted);
        
        // Check if newbie (account age < 7 days)
        const ageMs = Date.now() - created.getTime();
        setIsNewbie(ageMs < 7 * 24 * 60 * 60 * 1000);

      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [username]);

  // Load game data
  useEffect(() => {
    if (!userData?.id) return;
    
    let cancelled = false;
    (async () => {
      try {
        setLoadingData(true);
        const [s, h, rp] = await Promise.all([
          fetchUserGameStats(userData.id),
          fetchUserGameHistory(userData.id, 50),
          fetchUserRoyalePlacements(userData.id)
        ]);
        if (!cancelled) {
          setStats(s);
          setHistory(h);
          setPlacements(rp);
        }
      } catch (e: any) {
        if (!cancelled) setLoadError(e.message ?? 'Failed to load profile data');
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userData?.id]);

  // Ensure page reset when filter changes
  useEffect(() => {
    setGamePage(1);
  }, [gameFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopNavbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-muted-foreground">Loading profile...</div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopNavbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
              <p className="text-muted-foreground mb-4">The user "{username}" could not be found.</p>
              <Button onClick={() => navigate('/leaderboard')}>
                Back to Leaderboard
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const gameFilters = ['All', 'Wins', 'Losses'];

  // Small helper for ordinal formatting (1 -> 1st, 2 -> 2nd, ...)
  const toOrdinal = (n: number) => {
    const j = n % 10, k = n % 100;
    if (j === 1 && k !== 11) return `${n}st`;
    if (j === 2 && k !== 12) return `${n}nd`;
    if (j === 3 && k !== 13) return `${n}rd`;
    return `${n}th`;
  };

  // Format an ISO timestamp into a friendly label (e.g., "2h ago" or "Aug 9, 14:32")
  const formatEndedAt = (iso?: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    const now = Date.now();
    const diffSec = Math.floor((now - d.getTime()) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    // Same year: Month Day, HH:MM; else include year
    const optsSameYear: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const optsFull: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    const sameYear = new Date().getFullYear() === d.getFullYear();
    return new Intl.DateTimeFormat(undefined, sameYear ? optsSameYear : optsFull).format(d);
  };

  // Map fetched history into the shape the existing UI expects
  const gameHistory = history.map(h => ({
    id: h.match_id,
    game: h.game_type === 'snakeroyale' ? 'Snake Royale' : h.game_type === 'lastman' ? 'Lastman Standing' : 'Speed Chess',
    date: h.ended_at ?? '',
    dateLabel: formatEndedAt(h.ended_at),
    result: (h.final_position === 1 ? 'Win' : 'Loss') as 'Win' | 'Loss',
    pnl: `${((h.payout ?? 0) - (h.entry ?? 0)) >= 0 ? '+' : '-'}$${Math.abs((h.payout ?? 0) - (h.entry ?? 0)).toFixed(2)}`,
    type: (h.final_position === 1 ? 'win' : 'loss') as 'win' | 'loss',
    placement: h.final_position ?? null,
    placementLabel: h.final_position ? toOrdinal(h.final_position) : null,
    entryFee: h.entry ?? 0
  }));

  const filteredGameHistory =
    gameFilter === 'All'
      ? gameHistory
      : gameFilter === 'Wins'
      ? gameHistory.filter((g) => g.type === 'win')
      : gameHistory.filter((g) => g.type === 'loss');

  // Pagination for Game History
  const totalPages = Math.max(1, Math.ceil(filteredGameHistory.length / PAGE_SIZE));
  const currentPage = Math.min(gamePage, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedGameHistory = filteredGameHistory.slice(startIndex, startIndex + PAGE_SIZE);

  // Derive PnL dataset based on selected range
  const pnlDataAll = (stats.length > 0 && history.length > 0)
    ? history.map(h => ({
        date: h.ended_at ?? '',
        pnl: ((h.payout ?? 0) - (h.entry ?? 0))
      }))
    : gameHistory.map(g => ({ date: g.date, pnl: g.pnl }));
  const rangeToDays: Record<typeof pnlRange, number | 'ALL'> = { '7D': 7, '30D': 30, '90D': 90, 'ALL': 'ALL' };
  const selectedDays = rangeToDays[pnlRange];
  const cutoffDate = selectedDays === 'ALL' ? null : new Date(Date.now() - selectedDays * 24 * 60 * 60 * 1000);
  const pnlData = selectedDays === 'ALL'
    ? pnlDataAll
    : pnlDataAll.filter(d => new Date(d.date) >= (cutoffDate as Date));

  const isOwnProfile = currentUser?.username === username;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-0">
        <TopNavbar />

        <main className="flex-1 overflow-auto p-6">
          <div className="container mx-auto max-w-7xl space-y-6">
            {/* Header card - unified site styling */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start gap-6">

                  {/* User Info */}
                  <div className="flex-1 w-full">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                      <div className="w-full flex items-center px-4 py-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
                        <h1 className="text-2xl font-semibold leading-none">{userData?.username || username}</h1>
                      </div>
                    </div>

                    {/* Profile Badges */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 text-primary px-2 py-1 text-xs">
                        <Trophy className="w-3.5 h-3.5" />
                        Top 10%
                      </span>
                      {isNewbie && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 px-2 py-1 text-xs">
                          <Leaf className="w-3.5 h-3.5" />
                          Newbie
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-md border border-indigo-500/20 bg-indigo-500/10 text-indigo-500 px-2 py-1 text-xs">
                        <Rocket className="w-3.5 h-3.5" />
                        Beta Tester
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Member Since */}
                      <div className="rounded-md bg-muted/50 border border-border p-4">
                        <div className="text-xs text-muted-foreground mb-2">
                          Member Since
                        </div>
                        <div className="text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          {memberSince ?? '—'}
                        </div>
                      </div>

                      {/* Total PnL */}
                      <div className="rounded-md bg-muted/50 border border-border p-4">
                        <div className="text-xs text-muted-foreground mb-2">
                          Total PnL
                        </div>
                        <div className="text-sm flex items-center gap-2">
                          <Crown className="w-4 h-4 text-primary" />
                          {(() => {
                            // Derive total PnL from per-match history for accuracy
                            const n = gameHistory.reduce((sum, g) => {
                              const val = parseFloat(g.pnl.replace(/[^-0-9.]/g, ""));
                              return sum + (isNaN(val) ? 0 : val);
                            }, 0);
                            const formatted = n < 0
                              ? `-$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : `+$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                            return (
                              <span className={n < 0 ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
                                {formatted}
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Wallet - removed actual balance fetch, show placeholder */}
                      <div className="rounded-md bg-muted/50 border border-border p-4">
                        <div className="text-xs text-muted-foreground mb-2">
                          Wallet
                        </div>
                        <div className="text-sm flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">—</span>
                        </div>
                      </div>
                    </div>

                    {/* Game Stats Summary moved to top container */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {(() => {
                        // Compute wins/losses from per-match history for correctness
                        const totals = gameHistory.reduce((acc, g) => {
                          const val = parseFloat(g.pnl.replace(/[^-0-9.]/g, '')) || 0;
                          if (g.type === 'win') {
                            acc.wins += 1;
                            acc.net += val;
                          } else {
                            acc.losses += 1;
                            acc.net += val;
                          }
                          return acc;
                        }, { wins: 0, losses: 0, net: 0 });
                        const winRate = (totals.wins + totals.losses) > 0
                          ? Math.round((totals.wins / (totals.wins + totals.losses)) * 100)
                          : 0;

                        return (
                          <>
                            <div className="rounded-md bg-muted/50 border border-border p-4">
                              <div className="text-xs text-muted-foreground mb-2">Wins</div>
                              <div className="text-sm text-foreground font-medium flex items-center gap-2">
                                <Award className="w-4 h-4 text-primary" />
                                {totals.wins}
                              </div>
                            </div>
                            <div className="rounded-md bg-muted/50 border border-border p-4">
                              <div className="text-xs text-muted-foreground mb-2">Losses</div>
                              <div className="text-sm text-foreground font-medium flex items-center gap-2">
                                <ThumbsDown className="w-4 h-4 text-primary" />
                                {totals.losses}
                              </div>
                            </div>
                            <div className="rounded-md bg-muted/50 border border-border p-4">
                              <div className="text-xs text-muted-foreground mb-2">Win Rate</div>
                              <div className="text-sm text-foreground font-medium flex items-center gap-2">
                                <Percent className="w-4 h-4 text-primary" />
                                {winRate}%
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  
                </div>
              </CardContent>
            </Card>

            {/* Charts and history */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* PnL */}
              <Card className="bg-card border-border lg:col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Profit & Loss</CardTitle>

                    {/* Timeframe Filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground hidden sm:inline">Timeframe</span>
                      <Select value={pnlRange} onValueChange={(v) => setPnlRange(v as typeof pnlRange)}>
                        <SelectTrigger className="h-8 w-[130px] bg-background/50 border-border/50">
                          <SelectValue placeholder="30D" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7D">7D</SelectItem>
                          <SelectItem value="30D">30D</SelectItem>
                          <SelectItem value="90D">90D</SelectItem>
                          <SelectItem value="ALL">All Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-1">
                  {/* Improved readability container for the chart */}
                  <div className="rounded-lg border border-border bg-background/80 backdrop-blur-sm p-4 md:p-6">
                    <div className="mb-3 text-xs text-muted-foreground">
                      Based on game history
                    </div>
                    <div className="rounded-md bg-muted/30 p-3">
                      <PnLChart history={pnlData} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick actions */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-1">
                  <div className="space-y-3">
                    {isOwnProfile ? (
                      <>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => navigate('/profile')}
                        >
                          <Settings className="w-4 h-4 mr-2 text-primary" />
                          Edit Profile
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => navigate('/')}
                        >
                          <ArrowUpCircle className="w-4 h-4 mr-2 text-primary" />
                          Add Funds
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => navigate('/leaderboard')}
                        >
                          <Trophy className="w-4 h-4 mr-2 text-primary" />
                          View Leaderboard
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => navigate('/')}
                        >
                          <ArrowUpCircle className="w-4 h-4 mr-2 text-primary" />
                          Play Games
                        </Button>
                      </>
                    )}
                    <Button variant="outline" className="w-full justify-start">
                      <Receipt className="w-4 h-4 mr-2 text-primary" />
                      View Transactions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Game History */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Game History</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {gameFilters.map((filter) => (
                      <Button
                        key={filter}
                        size="sm"
                        variant={gameFilter === filter ? 'default' : 'outline'}
                        className={gameFilter === filter ? '' : 'bg-background'}
                        onClick={() => setGameFilter(filter)}
                      >
                        {filter}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 min-h-[15rem]">
                  {pagedGameHistory.map((game) => (
                    <div
                      key={game.id}
                      className="bg-muted/50 border border-border/30 rounded-lg p-3 hover:bg-muted transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm">{game.game}</h3>
                          {('placement' in game) && (game as any).placement && (
                            <span className="text-xs text-muted-foreground border border-border/40 rounded px-1.5 py-0.5">
                              {(game as any).placementLabel}
                            </span>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={`${
                            game.type === 'win'
                              ? 'text-green-500 border-green-500/30 bg-green-500/10'
                              : 'text-red-500 border-red-500/30 bg-red-500/10'
                          }`}
                        >
                          {game.result}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-[13px] leading-5">
                        <span className="text-muted-foreground">
                          {('dateLabel' in game) ? (game as any).dateLabel : (game as { date: string }).date}
                        </span>
                        <div className="flex items-center gap-3">
                          {('entryFee' in game) && (
                            <span className="text-muted-foreground"><span className="opacity-80">Entry Fee:</span> ${Number((game as any).entryFee).toFixed(2)}</span>
                          )}
                          <span className={`${
                            game.type === 'win' 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            {game.pnl}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGamePage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGamePage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default UserProfile;
