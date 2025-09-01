import { useEffect, useState } from "react";
import { MatchmakingModal } from "@/components/MatchmakingModal";
import { GameNavigation } from "@/components/GameNavigation";
import { MenuBackground } from "@/components/MenuBackground";
import { LeaderboardPage } from "@/components/LeaderboardPage";
import { FriendsPage } from "@/components/FriendsPage";
import { ProfilePage } from "@/components/ProfilePage";
import { SettingsPage } from "@/components/SettingsPage";
import { UserProfile } from "@/components/UserProfile";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Play } from "lucide-react";
import { ws } from "@/lib/ws";
import { useNavigate } from "react-router-dom";

const GameLobby = () => {
  const [activeSection, setActiveSection] = useState('main');
  const [showMatchmaking, setShowMatchmaking] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mock player data
  const playerData = {
    username: "SnakeHunter",
    level: 15,
    xp: 2450,
    maxXp: 3000,
    coins: 15750,
    rank: "Diamond",
    onlineFriends: 7,
  };

  const handlePlayClick = () => {
    setShowMatchmaking(true);
    ws.send('join_match', { entryFee: 1 });
  };

  const handleMatchFound = (_payload?: { matchId?: string; entryFee?: number }) => {
    setShowMatchmaking(false);
    const mode = _payload?.entryFee ?? 1;
    navigate(`/play?mode=${mode}`);
  };

  useEffect(() => {
    const onConnectSuccess = (d: any) => {
      // could store user state if needed
    };
    const onMatchFound = (payload: any) => {
      handleMatchFound(payload);
    };
    const onMatchCancelled = () => {
      setShowMatchmaking(false);
    };
    ws.on('connect_success', onConnectSuccess);
    ws.on('match_found', onMatchFound);
    ws.on('match_cancelled', onMatchCancelled);
    return () => {
      ws.off('connect_success', onConnectSuccess);
      ws.off('match_found', onMatchFound);
      ws.off('match_cancelled', onMatchCancelled);
    }
  }, []);

  const handlePlayerClick = (player: any) => {
    setSelectedUser(player);
    setShowUserProfile(true);
  };

  const handleFriendClick = (friend: any) => {
    setSelectedUser(friend);
    setShowUserProfile(true);
  };

  const handleBackToMain = () => {
    setShowUserProfile(false);
    setSelectedUser(null);
  };

  const renderMainMenu = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 pb-20">
      {/* Central Play Area */}
      <div className="text-center space-y-8 max-w-2xl mx-auto animate-slide-up">
        {/* Game Title */}
        <div className="space-y-4">
          <img 
            src="/lovable-uploads/07b149d2-c2bf-4f38-8c6e-25f209d640c2.png" 
            alt="SnakeRoyale" 
            className="w-auto h-auto max-w-[240px] mx-auto mt-12 mb-3 object-contain"
          />
          <p className="text-xl text-muted-foreground">
            Battle 100 players in the ultimate snake survival arena
          </p>
        </div>

        {/* Main Join Button */}
        <div className="space-y-6">
          <Button
            variant="default"
            size="lg"
            onClick={handlePlayClick}
            className="w-full max-w-md mx-auto py-2.5 px-4 text-sm md:text-base"
          >
            <Play className="h-5 w-5 mr-2" />
            Join Game
          </Button>

          {/* Wallet Display */}
          <div className="bg-card border border-border rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Your Balance</div>
                <div className="text-xl font-bold text-primary">$23.75</div>
              </div>
              <Button variant="secondary" size="sm" className="py-2 px-3 text-sm">
                Add Funds
              </Button>
            </div>
          </div>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">24,891</div>
            <div className="text-xs text-muted-foreground">Players Online</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-secondary">$47.2M</div>
            <div className="text-xs text-muted-foreground">Daily Prize Pool</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    if (showUserProfile && selectedUser) {
      return <UserProfile user={selectedUser} onBack={handleBackToMain} />;
    }

    switch (activeSection) {
      case 'main':
        return renderMainMenu();
      case 'leaderboard':
        return <LeaderboardPage onPlayerClick={handlePlayerClick} />;
      case 'friends':
        return <FriendsPage onFriendClick={handleFriendClick} />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return renderMainMenu();
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background snakes (no overlay) */}
      <div className="absolute inset-0">
        <MenuBackground />
      </div>

      {/* Foreground UI */}
      <div className="relative z-10">
        {renderSection()}

        <GameNavigation
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <MatchmakingModal
          open={showMatchmaking}
          onOpenChange={setShowMatchmaking}
          onMatchFound={handleMatchFound}
        />
      </div>
    </div>
  );
};

export default GameLobby;