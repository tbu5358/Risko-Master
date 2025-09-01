import { useRef, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const EMOJI_OPTIONS = ["😀", "😎", "😂", "👍", "👏", "🔥", "🎉", "😮", "😢", "😡", "🤔", "💯", "🏆", "🤝", "🙏"];

// Enhanced quick reply options
const QUICK_REPLIES = [
  { text: "GG", color: "from-green-500/20 to-green-600/20" },
  { text: "Thanks!", color: "from-blue-500/20 to-blue-600/20" },
  { text: "Well played!", color: "from-purple-500/20 to-purple-600/20" },
  { text: "Good move!", color: "from-yellow-500/20 to-yellow-600/20" },
  { text: "Rematch?", color: "from-cyan-500/20 to-cyan-600/20" },
  { text: "Good luck!", color: "from-red-500/20 to-red-600/20" }
];

interface Message {
  from: "white" | "black";
  message: string;
}

interface GameChatProps {
  messages: Message[];
  onSend: (msg: string) => void;
  myColor: "white" | "black";
  playerWhite: string;
  playerBlack: string;
  onTyping?: () => void;
  opponentTyping?: boolean;
}

export default function GameChat({ messages, onSend, myColor, playerWhite, playerBlack, onTyping, opponentTyping }: GameChatProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!showEmoji) return;
    function handleClick(e: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showEmoji]);

  function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const value = inputRef.current?.value.trim();
    if (value) {
      onSend(value);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleEmojiClick(emoji: string) {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart || 0;
      const end = inputRef.current.selectionEnd || 0;
      const val = inputRef.current.value;
      inputRef.current.value = val.slice(0, start) + emoji + val.slice(end);
      inputRef.current.focus();
      inputRef.current.selectionStart = inputRef.current.selectionEnd = start + emoji.length;
    }
    setShowEmoji(false);
  }

  function handleQuick(msg: string) {
    onSend(msg);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <Card className="w-80 h-[680px] flex flex-col bg-gradient-to-b from-card/95 to-card/90 backdrop-blur-sm border border-cyan-glow/30 shadow-2xl relative overflow-hidden">
      {/* Emoji picker above the entire chat card */}
      {showEmoji && (
        <div ref={emojiPickerRef} className="absolute z-50 -top-[-64px] left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-sm border border-cyan-glow/30 rounded-xl shadow-2xl p-3 flex flex-wrap gap-2 w-72 animate-fade-in">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              className="text-2xl p-2 rounded-lg hover:bg-cyan-glow/20 transition-all duration-200 hover:scale-110"
              onClick={() => handleEmojiClick(emoji)}
              type="button"
              aria-label={`Insert emoji ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      
      {/* Enhanced Header */}
      <CardHeader className="pb-4 border-b border-cyan-glow/20 bg-gradient-to-r from-cyan-glow/10 to-transparent">
        <CardTitle className="text-cyan-glow text-xl flex items-center gap-3 font-bold">
          <div className="w-3 h-3 bg-cyan-glow rounded-full animate-pulse"></div>
          <span className="bg-gradient-to-r from-cyan-glow to-cyan-400 bg-clip-text text-transparent">
            Game Chat
          </span>
        </CardTitle>
      </CardHeader>
      
      {/* Enhanced Messages Area */}
      <CardContent className="flex-1 overflow-y-auto space-y-4 px-4 py-4 bg-gradient-to-b from-transparent to-black/5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-12 text-center">
            <div className="text-6xl mb-4 opacity-40 animate-pulse">💬</div>
            <div className="text-muted-foreground text-base font-semibold mb-2">No messages yet</div>
            <div className="text-muted-foreground/60 text-sm">Start the conversation!</div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === myColor ? "justify-end" : "justify-start"}`}>
            <div className={`px-5 py-3 rounded-2xl max-w-[80%] text-sm shadow-xl transition-all duration-300 hover:scale-[1.02] ${
              msg.from === myColor 
                ? "bg-gradient-to-r from-cyan-500/90 to-cyan-600/90 text-black font-medium shadow-cyan-500/25" 
                : "bg-gradient-to-r from-gray-700/90 to-gray-800/90 text-white border border-gray-600/40 shadow-gray-700/25"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  msg.from === myColor 
                    ? "bg-cyan-600 text-white" 
                    : "bg-gray-600 text-gray-200"
                }`}>
                  {(msg.from === myColor ? (myColor === "white" ? playerWhite : playerBlack) : (msg.from === "white" ? playerWhite : playerBlack)).charAt(0).toUpperCase()}
                </div>
                <span className="font-bold text-xs opacity-90">
                  {msg.from === myColor ? (myColor === "white" ? playerWhite : playerBlack) : (msg.from === "white" ? playerWhite : playerBlack)}
                </span>
              </div>
              <div className="leading-relaxed">{msg.message}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>
      
      {/* Enhanced Footer */}
      <CardFooter className="pt-4 pb-4 flex flex-col gap-4 bg-gradient-to-t from-black/10 to-transparent border-t border-cyan-glow/20">
        {/* Enhanced input form */}
        <form className="w-full flex gap-2" onSubmit={handleSend} autoComplete="off">
          <button 
            type="button" 
            className="px-2 py-1.5 text-base rounded-md bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 transition-all duration-200 hover:scale-105 border border-yellow-500/40 shadow-lg" 
            onClick={() => setShowEmoji((v) => !v)} 
            aria-label="Emoji picker"
          >
            😊
          </button>
          <Input 
            ref={inputRef} 
            className="flex-1 bg-gray-800/60 border-gray-600/40 focus:border-cyan-500/60 focus:ring-cyan-500/20 transition-all duration-200 rounded-xl text-sm" 
            placeholder="Type a message..." 
            maxLength={200} 
            onChange={onTyping} 
          />
          <button 
            type="submit" 
            className="px-3 py-1.5 rounded-md bg-gradient-to-r from-cyan-500 to-cyan-600 text-black font-bold hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-cyan-500/25 text-xs"
          >
            Send
          </button>
        </form>
        
        {/* Enhanced quick chat messages */}
        <div className="grid grid-cols-2 gap-3">
          {QUICK_REPLIES.map((reply, index) => (
            <button 
              key={index}
              type="button" 
              className={`px-4 py-3 rounded-xl bg-gradient-to-r ${reply.color} text-white font-semibold hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl border border-white/20 text-sm`}
              onClick={() => handleQuick(reply.text)}
            >
              {reply.text}
            </button>
          ))}
        </div>
        
        {opponentTyping && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2 animate-pulse">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-cyan-glow rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-cyan-glow rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-cyan-glow rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="font-medium">{myColor === "white" ? playerBlack : playerWhite} is typing…</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
} 