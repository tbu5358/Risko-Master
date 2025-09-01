
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Send, MoreVertical } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isOwnMessage: boolean;
}

interface Friend {
  id: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  status: 'online' | 'playing' | 'away' | 'offline';
  currentGame?: string;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  friend: Friend;
}

const mockMessages: Message[] = [
  {
    id: '1',
    text: 'Hey! Want to play some Neon Blasters?',
    timestamp: '10:30 AM',
    isOwnMessage: false
  },
  {
    id: '2',
    text: 'Sure! Let me finish this match first',
    timestamp: '10:32 AM',
    isOwnMessage: true
  },
  {
    id: '3',
    text: 'No problem, I\'ll wait in the lobby',
    timestamp: '10:33 AM',
    isOwnMessage: false
  },
  {
    id: '4',
    text: 'Ready! Let\'s go 🎮',
    timestamp: '10:35 AM',
    isOwnMessage: true
  }
];

export const ChatWindow = ({ isOpen, onClose, onBack, friend }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwnMessage: true
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simulate friend response
    setTimeout(() => {
      const responses = [
        'Cool!',
        'Nice one!',
        'Let\'s play!',
        'GG!',
        'Ready when you are',
        'That was epic!'
      ];
      
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwnMessage: false
      };

      setMessages(prev => [...prev, response]);
    }, 1000 + Math.random() * 2000);
  };

  const getStatusColor = (status: Friend['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'playing': return 'bg-primary';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md h-[600px] p-0 bg-card border-border flex flex-col">
        {/* Chat Header */}
        <DialogHeader className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-1 hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="relative">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/20 text-primary font-mono text-xs">
                    {friend.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(friend.status)} border-2 border-background`} />
              </div>
              <div>
                <DialogTitle className="font-mono font-medium text-sm">
                  {friend.username}
                </DialogTitle>
                <p className="font-mono text-xs text-muted-foreground">
                  {friend.status === 'playing' && friend.currentGame
                    ? `Playing ${friend.currentGame}`
                    : friend.status
                  }
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="p-1">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg font-mono text-sm ${
                    message.isOwnMessage
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p>{message.text}</p>
                  <p className={`text-xs mt-1 opacity-70 ${
                    message.isOwnMessage ? 'text-right' : 'text-left'
                  }`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-border flex-shrink-0">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="bg-input border-border font-mono"
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button
              onClick={sendMessage}
              size="sm"
              className="bg-primary hover:bg-primary/80 text-primary-foreground neon-glow"
              disabled={!newMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
