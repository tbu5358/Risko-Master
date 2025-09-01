
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, UserPlus, MessageCircle, Ban, UserMinus, Users, Send } from 'lucide-react';
import { toast } from 'sonner';
import { ChatWindow } from '@/components/ChatWindow';

interface Friend {
  id: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  status: 'online' | 'playing' | 'away' | 'offline';
  currentGame?: string;
}

interface FriendsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockFriends: Friend[] = [
  { id: '1', username: 'CyberNinja', isOnline: true, status: 'playing', currentGame: 'Neon Blasters' },
  { id: '2', username: 'QuantumGamer', isOnline: true, status: 'online' },
  { id: '3', username: 'VoidRacer99', isOnline: true, status: 'playing', currentGame: 'Rocket Royale' },
  { id: '4', username: 'NeonPilot', isOnline: false, status: 'offline' },
  { id: '5', username: 'DataHacker', isOnline: true, status: 'away' },
];

const mockBlocked: Friend[] = [
  { id: '6', username: 'ToxicPlayer', isOnline: false, status: 'offline' },
];

export const FriendsPanel = ({ isOpen, onClose }: FriendsPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newFriendInput, setNewFriendInput] = useState('');
  const [friends, setFriends] = useState(mockFriends);
  const [blocked, setBlocked] = useState(mockBlocked);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  const getStatusColor = (status: Friend['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'playing': return 'bg-primary';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (friend: Friend) => {
    if (friend.status === 'playing' && friend.currentGame) {
      return `Playing ${friend.currentGame}`;
    }
    return friend.status.charAt(0).toUpperCase() + friend.status.slice(1);
  };

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onlineFriends = friends.filter(friend => friend.isOnline);

  const addFriend = () => {
    if (!newFriendInput.trim()) return;

    toast.success(`Friend request sent to ${newFriendInput} (demo)`);
    setNewFriendInput('');
  };

  const blockFriend = (friendId: string) => {
    const friend = friends.find(f => f.id === friendId);
    if (friend) {
      setFriends(friends.filter(f => f.id !== friendId));
      setBlocked([...blocked, { ...friend, isOnline: false, status: 'offline' }]);
      toast.success(`${friend.username} has been blocked`);
    }
  };

  const unblockFriend = (friendId: string) => {
    const friend = blocked.find(f => f.id === friendId);
    if (friend) {
      setBlocked(blocked.filter(f => f.id !== friendId));
      setFriends([...friends, { ...friend, isOnline: Math.random() > 0.5, status: 'online' }]);
      toast.success(`${friend.username} has been unblocked`);
    }
  };

  const removeFriend = (friendId: string) => {
    const friend = friends.find(f => f.id === friendId);
    if (friend) {
      setFriends(friends.filter(f => f.id !== friendId));
      toast.success(`${friend.username} has been removed from friends`);
    }
  };

  if (selectedChat) {
    return (
      <ChatWindow
        isOpen={isOpen}
        onClose={() => setSelectedChat(null)}
        onBack={() => setSelectedChat(null)}
        friend={friends.find(f => f.id === selectedChat)!}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-pixel text-primary flex items-center gap-2">
            <Users className="w-5 h-5" />
            Friends & Social
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="font-mono">
              All Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="online" className="font-mono">
              Online ({onlineFriends.length})
            </TabsTrigger>
            <TabsTrigger value="blocked" className="font-mono">
              Blocked ({blocked.length})
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search friends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border font-mono"
              />
            </div>

            {/* Add Friend */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter username or email..."
                value={newFriendInput}
                onChange={(e) => setNewFriendInput(e.target.value)}
                className="bg-input border-border font-mono"
                onKeyPress={(e) => e.key === 'Enter' && addFriend()}
              />
              <Button onClick={addFriend} size="sm" className="bg-accent hover:bg-accent/80 neon-glow">
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="mt-4">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredFriends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/20 text-primary font-mono">
                          {friend.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(friend.status)} border-2 border-background`} />
                    </div>
                    <div>
                      <p className="font-mono font-medium">{friend.username}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {getStatusText(friend)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedChat(friend.id)}
                      className="text-primary hover:text-primary/80"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => blockFriend(friend.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Ban className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFriend(friend.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="online" className="mt-4">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {onlineFriends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/20 text-primary font-mono">
                          {friend.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(friend.status)} border-2 border-background`} />
                    </div>
                    <div>
                      <p className="font-mono font-medium">{friend.username}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {getStatusText(friend)}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setSelectedChat(friend.id)}
                    className="bg-primary hover:bg-primary/80 text-primary-foreground neon-glow"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Chat
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="blocked" className="mt-4">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {blocked.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 opacity-50">
                      <AvatarFallback className="bg-muted text-muted-foreground font-mono">
                        {friend.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-mono font-medium text-muted-foreground">{friend.username}</p>
                      <p className="font-mono text-xs text-muted-foreground">Blocked</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => unblockFriend(friend.id)}
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
