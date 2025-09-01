import { useEffect, useRef, useState } from "react";

export type LobbyEvent =
  | { type: "lobby-chat"; username: string; message: string; timestamp: string }
  | { type: "lobby-player-ready"; username: string; color: "white" | "black" }
  | { type: "lobby-both-ready" }
  | { type: "lobby-match-starting" }
  | { type: "lobby-opponent-joined"; username: string }
  | { type: "lobby-countdown"; seconds: number }
  | { type: "lobby-cancel" }
  | { type: "lobby-joined"; username: string };

// Global socket management to prevent multiple connections
let globalLobbySocket: WebSocket | null = null;
let globalMatchId: string | null = null;
let eventListeners: Array<(event: LobbyEvent) => void> = [];

function getOrCreateLobbySocket(matchId: string, username: string): WebSocket {
  // If we have a socket for the same match, reuse it
  if (globalLobbySocket && globalLobbySocket.readyState === WebSocket.OPEN && globalMatchId === matchId) {
    return globalLobbySocket;
  }
  
  // Close existing connection if it's for a different match
  if (globalLobbySocket) {
    console.log('[LobbySocket] Closing existing connection for different match');
    globalLobbySocket.close();
  }
  
  console.log('[LobbySocket] Creating new WebSocket connection for match:', matchId);
const ws = new WebSocket("ws://localhost:8081");
  globalLobbySocket = ws;
  globalMatchId = matchId;
  
  ws.onopen = () => {
    console.log('[LobbySocket] WebSocket connected, joining lobby for match:', matchId);
    ws.send(JSON.stringify({ 
      type: "join-lobby", 
      matchId, 
      username 
    }));
  };
  
  ws.onmessage = (msg) => {
    try {
      const data = JSON.parse(msg.data);
      console.log('[LobbySocket] Received event:', data);
      eventListeners.forEach(listener => {
        listener(data);
      });
    } catch (error) {
      console.error("Failed to parse lobby message:", error);
    }
  };
  
  ws.onerror = (err) => {
    console.error("Lobby WebSocket error:", err);
  };
  
  ws.onclose = (event) => {
    console.log('[LobbySocket] WebSocket closed, code:', event.code, 'reason:', event.reason);
    // Only clear the global socket if it's the same one that closed
    if (globalLobbySocket === ws) {
      globalLobbySocket = null;
      globalMatchId = null;
    }
  };
  
  return ws;
}

export function useLobbySocket({
  matchId,
  username,
  onEvent,
  onStartMatch,
}: {
  matchId: string;
  username: string;
  onEvent: (event: LobbyEvent) => void;
  onStartMatch: () => void;
}) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!matchId) return;
    
    // Add this component's event listener
    eventListeners.push(onEvent);
    
    // Get or create the global socket
    const ws = getOrCreateLobbySocket(matchId, username);
    socketRef.current = ws;
    
    // Update connected state
    setConnected(ws.readyState === WebSocket.OPEN);
    
    // Set up an interval to check connection status
    const statusInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        setConnected(true);
      } else {
        setConnected(false);
      }
    }, 1000);
    
    return () => {
      // Remove this component's event listener
      const index = eventListeners.indexOf(onEvent);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
      clearInterval(statusInterval);
      
      // Only close the socket if no other components are using it
      if (eventListeners.length === 0 && globalLobbySocket === ws) {
        console.log('[LobbySocket] No more listeners, closing socket');
      ws.close();
        globalLobbySocket = null;
        globalMatchId = null;
      }
    };
  }, [matchId, username, onEvent]);

  function send(event: LobbyEvent) {
    const socket = socketRef.current || globalLobbySocket;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(event));
    } else {
      console.error('[LobbySocket] Cannot send event - WebSocket not ready:', socket?.readyState);
    }
  }

  return {
    connected,
    sendLobbyChat: (message: string) => send({ 
      type: "lobby-chat", 
      username, 
      message, 
      timestamp: new Date().toISOString() 
    }),
    sendPlayerReady: (color: "white" | "black") => send({ 
      type: "lobby-player-ready", 
      username, 
      color 
    }),
    sendBothReady: () => send({ type: "lobby-both-ready" }),
    sendMatchStarting: () => send({ type: "lobby-match-starting" }),
    sendCancelMatch: () => send({ type: "lobby-cancel" }),
    sendLobbyJoined: (username: string) => send({ 
      type: "lobby-joined", 
      username 
    }),
  };
} 