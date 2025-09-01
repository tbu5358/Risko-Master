import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProfilePage } from "./ProfilePage";

interface UserProfileProps {
  user: {
    id: string;
    username: string;
    level?: number;
    xp?: number;
    maxXp?: number;
    winnings?: number;
    gamesPlayed?: number;
    gamesWon?: number;
    rank?: string;
    avatar?: string;
  };
  onBack: () => void;
}

export const UserProfile = ({ user, onBack }: UserProfileProps) => {
  // Convert user data to match ProfilePage format
  const playerData = {
    username: user.username,
    level: user.level || 10,
    xp: user.xp || 1500,
    maxXp: user.maxXp || 2000,
    winnings: user.winnings || Math.floor(Math.random() * 30000 + 5000),
    gamesPlayed: user.gamesPlayed || Math.floor(Math.random() * 100 + 20),
    gamesWon: user.gamesWon || Math.floor(Math.random() * 30 + 5),
    rank: user.rank || "Gold",
    avatar: user.avatar,
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={onBack}
        className="fixed top-6 left-6 z-50 bg-gray-900/90 border-orange-500/30 text-white hover:bg-orange-500/10"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      
      <ProfilePage player={playerData} isOwnProfile={false} />
    </div>
  );
};