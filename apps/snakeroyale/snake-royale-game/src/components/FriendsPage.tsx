import { useState } from "react";
import { Search, UserPlus, Check, X, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Friend {
  id: string;
  username: string;
  isOnline: boolean;
  status: 'friend' | 'pending' | 'request';
  avatar?: string;
}

interface FriendsPageProps {
  onFriendClick: (friend: Friend) => void;
}

export const FriendsPage = ({ onFriendClick }: FriendsPageProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock friends data
  const [friends, setFriends] = useState<Friend[]>([
    { id: '1', username: 'SnakeKing', isOnline: true, status: 'friend' },
    { id: '2', username: 'VenomStrike', isOnline: true, status: 'friend' },
    { id: '3', username: 'CobraQueen', isOnline: false, status: 'friend' },
    { id: '4', username: 'PythonMaster', isOnline: true, status: 'friend' },
    { id: '5', username: 'SlitherPro', isOnline: false, status: 'friend' },
    { id: '6', username: 'ToxicViper', isOnline: false, status: 'pending' },
    { id: '7', username: 'NeonSnake', isOnline: true, status: 'request' },
  ]);

  const handleAcceptFriend = (friendId: string) => {
    setFriends(prev => prev.map(f => 
      f.id === friendId ? { ...f, status: 'friend' as const } : f
    ));
  };

  const handleRejectFriend = (friendId: string) => {
    setFriends(prev => prev.filter(f => f.id !== friendId));
  };

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeFriends = filteredFriends.filter(f => f.status === 'friend');
  const pendingRequests = filteredFriends.filter(f => f.status === 'pending');
  const incomingRequests = filteredFriends.filter(f => f.status === 'request');

  const FriendCard = ({ friend }: { friend: Friend }) => (
    <div className="bg-gray-900/50 border border-orange-500/30 rounded-lg p-4 flex items-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-lg">
          {friend.username.charAt(0)}
        </div>
        {friend.isOnline && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
        )}
      </div>

      <div 
        className="flex-1 cursor-pointer"
        onClick={() => onFriendClick(friend)}
      >
        <div className="font-semibold text-white hover:text-yellow-400 transition-colors">
          {friend.username}
        </div>
        <div className={`text-sm ${friend.isOnline ? 'text-green-400' : 'text-gray-400'}`}>
          {friend.isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      <div className="flex gap-2">
        {friend.status === 'friend' && friend.isOnline && (
          <Button variant="default" size="sm" className="bg-orange-500 hover:bg-orange-600">
            Invite
          </Button>
        )}
        {friend.status === 'request' && (
          <>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => handleAcceptFriend(friend.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => handleRejectFriend(friend.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
        {friend.status === 'pending' && (
          <div className="text-sm text-yellow-400 px-3 py-1">Pending</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-black">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-center text-yellow-400">
          👥 Friends
        </h2>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search or add friends by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900/50 border-orange-500/30 text-white placeholder:text-gray-400"
          />
          <Button 
            variant="default"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600"
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>

        {/* Friend Requests */}
        {incomingRequests.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">Friend Requests</h3>
            <div className="space-y-3">
              {incomingRequests.map((friend) => (
                <FriendCard key={friend.id} friend={friend} />
              ))}
            </div>
          </div>
        )}

        {/* Active Friends */}
        <div>
          <h3 className="text-lg font-semibold text-yellow-400 mb-3">
            Friends ({activeFriends.filter(f => f.isOnline).length} online)
          </h3>
          <div className="space-y-3">
            {activeFriends.map((friend) => (
              <FriendCard key={friend.id} friend={friend} />
            ))}
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">Pending Requests</h3>
            <div className="space-y-3">
              {pendingRequests.map((friend) => (
                <FriendCard key={friend.id} friend={friend} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};