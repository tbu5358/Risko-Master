import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopNavbar } from '@/components/TopNavbar';
import { AddFundsModal } from '@/components/AddFundsModal';
import { PnLChart } from '@/components/PnLChart';
import { FriendsPanel } from '@/components/FriendsPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/authStore';
import { TrendingUp, Gamepad2, Trophy, Target, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [matchFilter, setMatchFilter] = useState<'all' | 'wins' | 'losses' | 'big-pnl'>('all');
  const { isLoggedIn, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn || !user) {
    return null;
  }

  const keyMetrics = [
    {
      title: 'Total PnL',
      value: `$${(user.stats.totalProfits * 2500).toFixed(2)}`,
      change: '+12.5%',
      icon: TrendingUp,
      positive: true
    },
    {
      title: 'Games Played',
      value: user.stats.gamesPlayed.toString(),
      change: '+3 today',
      icon: Gamepad2,
      positive: true
    },
    {
      title: 'Win Rate',
      value: user.stats.winRate,
      change: '+2.1%',
      icon: Trophy,
      positive: true
    }
  ];

  const todaysHighlights = {
    bestMatch: { game: 'Quantum Chess', pnl: '+$11.25', opponent: 'VoidRacer99' },
    winStreak: 3
  };

  const topTraders = [
    { rank: 1, username: 'QuantumKing', pnl: '+$58.50' },
    { rank: 2, username: 'CryptoNinja', pnl: '+$49.50' },
    { rank: 3, username: 'EliteGamer', pnl: '+$39.00' }
  ];

  const recentMatches = [
    { game: 'Neon Blasters', result: 'Win', pnl: '+$5.75', time: '2 mins ago', opponent: 'CyberNinja' },
    { game: 'Rocket Royale', result: 'Loss', pnl: '-$3.00', time: '15 mins ago', opponent: 'QuantumGamer' },
    { game: 'Quantum Chess', result: 'Win', pnl: '+$11.25', time: '1 hour ago', opponent: 'VoidRacer99' },
    { game: 'Cyber Arena', result: 'Win', pnl: '+$4.50', time: '2 hours ago', opponent: 'NeonPilot' },
    { game: 'Neon Blasters', result: 'Loss', pnl: '-$2.00', time: '3 hours ago', opponent: 'DataHacker' },
    { game: 'Rocket Royale', result: 'Win', pnl: '+$8.75', time: '4 hours ago', opponent: 'ProGamer' },
    { game: 'Quantum Chess', result: 'Win', pnl: '+$7.00', time: '5 hours ago', opponent: 'ElitePlayer' },
    { game: 'Cyber Arena', result: 'Loss', pnl: '-$3.75', time: '6 hours ago', opponent: 'TopTier' },
    { game: 'Neon Blasters', result: 'Win', pnl: '+$10.25', time: '7 hours ago', opponent: 'GamerOne' },
    { game: 'Rocket Royale', result: 'Win', pnl: '+$8.25', time: '8 hours ago', opponent: 'SkillMaster' },
  ];

  const filteredMatches = recentMatches.filter(match => {
    switch (matchFilter) {
      case 'wins': return match.result === 'Win';
      case 'losses': return match.result === 'Loss';
      case 'big-pnl': return Math.abs(parseFloat(match.pnl.replace('$', '').replace('+', '').replace('-', ''))) >= 7.50;
      default: return true;
    }
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNavbar />
        <main className="flex-1 overflow-auto pb-12">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="font-bold text-2xl md:text-3xl text-foreground mb-2">
              Your At-a-Glance Performance Hub
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user.username}! Here's your performance snapshot.
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {keyMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.title} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                      <Badge variant={metric.positive ? "default" : "destructive"}>
                        {metric.change}
                      </Badge>
                    </div>
                    <div>
                      <p className={`text-3xl font-bold mb-1 ${
                        metric.title === 'Total PnL' && String(metric.value).startsWith('$') && !String(metric.value).startsWith('$-')
                          ? 'text-green-500' 
                          : metric.title === 'Total PnL' && String(metric.value).startsWith('$-')
                          ? 'text-red-500'
                          : 'text-foreground'
                      }`}>
                        {metric.value}
                      </p>
                      <p className="text-sm text-primary font-medium">
                        {metric.title}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Performance Chart */}
            <Card className="lg:col-span-2 bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary font-bold">Performance Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <PnLChart />
              </CardContent>
            </Card>

            {/* Today's Highlights */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary font-bold">Today's Highlights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-2">Best Match</p>
                  <p className="font-semibold text-foreground">
                    <span className="text-green-500">{todaysHighlights.bestMatch.pnl}</span> on {todaysHighlights.bestMatch.game}
                  </p>
                  <p className="text-xs text-muted-foreground">vs {todaysHighlights.bestMatch.opponent}</p>
                </div>
                
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-2">Win Streak</p>
                  <p className="font-semibold text-foreground text-xl">
                    {todaysHighlights.winStreak} 🎉
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mini Leaderboard */}
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="text-primary font-bold flex items-center">
                <Crown className="w-5 h-5 mr-2" />
                Top Traders (24hrs)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topTraders.map((trader) => (
                  <div key={trader.rank} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {trader.rank}
                      </Badge>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {trader.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{trader.username}</span>
                    </div>
                    <span className="font-bold text-green-500">{trader.pnl}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interactive Recent Matches Feed */}
          <Card className="bg-card border-border mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-primary font-bold">Recent Matches Feed</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={matchFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMatchFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={matchFilter === 'wins' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMatchFilter('wins')}
                >
                  Wins
                </Button>
                <Button
                  variant={matchFilter === 'losses' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMatchFilter('losses')}
                >
                  Losses
                </Button>
                <Button
                  variant={matchFilter === 'big-pnl' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMatchFilter('big-pnl')}
                >
                  Big PnL
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMatches.map((match, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${
                      match.result === 'Win' 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-foreground text-sm">{match.game}</h4>
                      <Badge 
                        variant={match.result === 'Win' ? 'default' : 'destructive'}
                        className={match.result === 'Win' ? 'bg-green-500 hover:bg-green-600' : ''}
                      >
                        {match.result}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {match.opponent.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">vs {match.opponent}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${
                        match.pnl.startsWith('+') ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {match.pnl}
                      </span>
                      <span className="text-xs text-muted-foreground">{match.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate('/')}
              className="bg-primary hover:bg-primary/80 text-primary-foreground justify-start h-auto p-6"
            >
              <Gamepad2 className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Play Now</div>
                <div className="text-sm opacity-80">Start a new match</div>
              </div>
            </Button>
            <Button
              onClick={() => setShowFriends(true)}
              variant="outline"
              className="border-border hover:border-primary/50 justify-start h-auto p-6"
            >
              <Target className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Challenge Friend</div>
                <div className="text-sm opacity-80">Send a challenge</div>
              </div>
            </Button>
            <Button
              onClick={() => navigate('/leaderboard')}
              variant="outline"
              className="border-border hover:border-primary/50 justify-start h-auto p-6"
            >
              <Trophy className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Leaderboard</div>
                <div className="text-sm opacity-80">Chase the leaders</div>
              </div>
            </Button>
          </div>
        </div>
        </main>
      </div>

      <AddFundsModal
        isOpen={showAddFunds}
        onClose={() => setShowAddFunds(false)}
      />

      <FriendsPanel
        isOpen={showFriends}
        onClose={() => setShowFriends(false)}
      />
    </div>
  );
};

export default Dashboard;
