import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { Search, UserPlus, Check, X, Users } from "lucide-react";
import { CreateMatchModal } from "@/components/ui/create-match-modal";
import { ClickableUsername } from "@/components/ui/clickable-username";

interface Friend {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  status: "online" | "offline";
}

interface FriendRequest {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  status: "online" | "offline";
}

interface PendingRequest {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  status: "online" | "offline";
}

export default function Friends() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [challengedFriend, setChallengedFriend] = useState<Friend | null>(null);

  // Mock data based on the reference image
  const friendRequests: FriendRequest[] = [
    {
      id: "1",
      name: "NeonSnake",
      avatar: "N",
      isOnline: true,
      status: "online"
    }
  ];

  const friends: Friend[] = [
    {
      id: "1",
      name: "SnakeKing",
      avatar: "S",
      isOnline: true,
      status: "online"
    },
    {
      id: "2",
      name: "VenomStrike",
      avatar: "V",
      isOnline: true,
      status: "online"
    },
    {
      id: "3",
      name: "CobraQueen",
      avatar: "C",
      isOnline: false,
      status: "offline"
    },
    {
      id: "4",
      name: "PythonMaster",
      avatar: "P",
      isOnline: true,
      status: "online"
    },
    {
      id: "5",
      name: "SlitherPro",
      avatar: "S",
      isOnline: false,
      status: "offline"
    }
  ];

  const pendingRequests: PendingRequest[] = [
    {
      id: "1",
      name: "ToxicViper",
      avatar: "T",
      isOnline: false,
      status: "offline"
    }
  ];

  const onlineFriendsCount = friends.filter(friend => friend.isOnline).length;

  const handleAcceptRequest = (id: string) => {
    console.log("Accept friend request:", id);
  };

  const handleDeclineRequest = (id: string) => {
    console.log("Decline friend request:", id);
  };

  const handleChallengeFriend = (friend: Friend) => {
    setChallengedFriend(friend);
    setIsChallengeModalOpen(true);
  };

  const handleAddFriend = () => {
    console.log("Add friend clicked");
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative pb-20" style={{ backgroundImage: 'url(/src/assets/mystical-chess-arena.png)' }}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-8 w-8 text-electric-blue" />
              <h1 className="text-3xl font-bold text-metallic-silver">Friends</h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search or add friends by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-12 h-12 bg-midnight-dark/70 backdrop-blur-md border-electric-blue/20 text-metallic-silver placeholder:text-muted-foreground"
            />
            <Button
              onClick={handleAddFriend}
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-burnt-orange hover:bg-burnt-orange/80"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>

          {/* Friend Requests */}
          {friendRequests.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-metallic-silver mb-3">Friend Requests</h2>
              <div className="space-y-2">
                {friendRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 rounded-xl bg-midnight-dark/70 backdrop-blur-md border border-electric-blue/20">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-burnt-orange flex items-center justify-center">
                          <span className="text-white font-bold">{request.avatar}</span>
                        </div>
                        {request.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-midnight-dark"></div>
                        )}
                      </div>
                                          <div>
                      <ClickableUsername username={request.name} className="font-semibold text-metallic-silver">
                        {request.name}
                      </ClickableUsername>
                      <div className={`text-xs ${request.isOnline ? 'text-green-400' : 'text-muted-foreground'}`}>
                        {request.status === 'online' ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                      <Button
                        onClick={() => handleAcceptRequest(request.id)}
                        size="sm"
                        className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeclineRequest(request.id)}
                        size="sm"
                        className="h-8 w-8 p-0 bg-red-500 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-metallic-silver mb-3">
              Friends ({onlineFriendsCount} online)
            </h2>
            <div className="space-y-2">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-3 rounded-xl bg-midnight-dark/70 backdrop-blur-md border border-electric-blue/20">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-burnt-orange flex items-center justify-center">
                        <span className="text-white font-bold">{friend.avatar}</span>
                      </div>
                      {friend.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-midnight-dark"></div>
                      )}
                    </div>
                    <div>
                      <ClickableUsername username={friend.name} className="font-semibold text-metallic-silver">
                        {friend.name}
                      </ClickableUsername>
                      <div className={`text-xs ${friend.isOnline ? 'text-green-400' : 'text-muted-foreground'}`}>
                        {friend.status === 'online' ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  </div>
                  {friend.isOnline && (
                    <Button
                      onClick={() => handleChallengeFriend(friend)}
                      size="sm"
                      className="bg-burnt-orange hover:bg-burnt-orange/80 text-white"
                    >
                      Challenge
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-metallic-silver mb-3">Pending Requests</h2>
              <div className="space-y-2">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 rounded-xl bg-midnight-dark/70 backdrop-blur-md border border-electric-blue/20">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-burnt-orange flex items-center justify-center">
                          <span className="text-white font-bold">{request.avatar}</span>
                        </div>
                        {request.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-midnight-dark"></div>
                        )}
                      </div>
                      <div>
                        <ClickableUsername username={request.name} className="font-semibold text-metallic-silver">
                          {request.name}
                        </ClickableUsername>
                        <div className={`text-xs ${request.isOnline ? 'text-green-400' : 'text-muted-foreground'}`}>
                          {request.status === 'online' ? 'Online' : 'Offline'}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-muted-foreground border-muted-foreground/30"
                      disabled
                    >
                      Pending
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <BottomNavigation />

      {/* Challenge Modal */}
      {challengedFriend && (
        <CreateMatchModal 
          open={isChallengeModalOpen} 
          onOpenChange={setIsChallengeModalOpen}
          challengeMode={true}
          challengedFriend={challengedFriend}
        />
      )}
    </div>
  );
} 