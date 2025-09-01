import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar } from "./ui/avatar";
import { Card } from "./ui/card";
import { useAuthStore } from "@/stores/authStore";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  avatar?: string;
}

const mockMessages: Message[] = [
  {
    id: "1",
    sender: "PlayerAlpha",
    text: "Hey everyone! Anyone up for some games?",
    timestamp: "2:30 PM",
    isOwn: false,
    avatar: "🎮"
  },
  {
    id: "2",
    sender: "PlayerBeta",
    text: "Who's online? Looking for some competition!",
    timestamp: "2:31 PM",
    isOwn: false,
    avatar: "⚡"
  },
  {
    id: "3",
    sender: "PlayerGamma",
    text: "Just hit a huge win on slots! This platform is amazing!",
    timestamp: "2:32 PM",
    isOwn: false,
    avatar: "🔥"
  }
];

export const PersistentChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages] = useState<Message[]>(mockMessages);
  const { isLoggedIn } = useAuthStore();

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isLoggedIn) return;
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg transition-all duration-300 hover:scale-110"
          size="icon"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-primary-foreground" />
          ) : (
            <MessageCircle className="h-6 w-6 text-primary-foreground" />
          )}
        </Button>
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40">
          <Card className="w-80 h-96 bg-background/95 backdrop-blur-sm shadow-2xl border border-border/50 overflow-hidden transform transition-all duration-300 ease-out animate-in slide-in-from-bottom-4 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-foreground">Global Chat</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 h-64 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.isOwn ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <div className="w-full h-full bg-muted rounded-full flex items-center justify-center text-sm">
                        {message.avatar || (message.isOwn ? "Y" : "G")}
                      </div>
                    </Avatar>
                    <div className={`flex-1 max-w-[70%] ${message.isOwn ? "text-right" : "text-left"}`}>
                      <div
                        className={`inline-block px-3 py-2 rounded-lg text-sm ${
                          message.isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {message.text}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {message.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input Area or Login Prompt */}
            <div className="p-4 border-t border-border bg-muted/20">
              {isLoggedIn ? (
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 bg-background"
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="icon"
                    disabled={!newMessage.trim()}
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Please log in to chat
                  </p>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => {
                      // This would typically open the auth modal
                      console.log("Open login modal");
                    }}
                  >
                    Log In
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  );
};