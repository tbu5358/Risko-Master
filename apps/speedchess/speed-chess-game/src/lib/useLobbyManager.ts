import { useEffect, useRef, useState, useCallback } from "react";

export type LobbyMatch = {
  id: string;
  playerWhite: string;
  playerBlack?: string;
  wager: number;
  timePerSide: number;
  waiting: boolean;
  state: "waiting" | "active" | "ended";
  createdAt: number;
  hasActivePlayers?: boolean;
};

export type LobbyEvent =
  | { type: "match-created"; match: LobbyMatch }
  | { type: "match-joined"; matchId: string; playerBlack: string }
  | { type: "match-removed"; matchId: string }
  | { type: "match-updated"; match: LobbyMatch }
  | { type: "lobby-error"; message: string };

// Singleton WebSocket connection
let globalSocket: WebSocket | null = null;
let globalUsername: string | null = null;
let eventListeners: Array<(event: LobbyEvent) => void> = [];
let matchesState: LobbyMatch[] = [];
let connectedState = false;

function getOrCreateSocket(username: string): WebSocket {
  if (globalSocket && globalSocket.readyState === WebSocket.OPEN && globalUsername === username) {
    return globalSocket;
  }
  
  // Close existing connection if username changed
  if (globalSocket) {
    globalSocket.close();
  }
  
  console.log('[LobbyManager] Creating new WebSocket connection for:', username);
  const ws = new WebSocket("ws://localhost:8081");
  globalSocket = ws;
  globalUsername = username;
  
  ws.onopen = () => {
    console.log('[LobbyManager] WebSocket connected, joining lobby manager as:', username);
    connectedState = true;
    
    // Send join message immediately when connection opens
    ws.send(JSON.stringify({ 
      type: "join-lobby-manager", 
      username 
    }));
  };
  
  ws.onmessage = (msg) => {
    try {
      const data = JSON.parse(msg.data);
      console.log('[LobbyManager] Received message:', data);
      
      switch (data.type) {
        case 'lobby-matches-update':
          console.log('[LobbyManager] Updating matches:', data.matches?.length || 0, 'matches');
          matchesState = data.matches || [];
          // Update local state but don't send events for this
          break;
        case 'match-created':
          console.log('[LobbyManager] Received event:', data);
          eventListeners.forEach(listener => {
            listener({ type: "match-created", match: data.match });
          });
          break;
        case 'match-joined':
          console.log('[LobbyManager] Received event:', data);
          eventListeners.forEach(listener => {
            listener({ type: "match-joined", matchId: data.matchId, playerBlack: data.playerBlack });
          });
          break;
        case 'match-removed':
          console.log('[LobbyManager] Received event:', data);
          eventListeners.forEach(listener => {
            listener({ type: "match-removed", matchId: data.matchId });
          });
          break;
        case 'match-updated':
          console.log('[LobbyManager] Received event:', data);
          eventListeners.forEach(listener => {
            listener({ type: "match-updated", match: data.match });
          });
          break;
        case 'lobby-error':
          console.log('[LobbyManager] Received event:', data);
          eventListeners.forEach(listener => {
            listener({ type: "lobby-error", message: data.message });
          });
          break;
        default:
          console.log('[LobbyManager] Unknown event type:', data.type);
          break;
      }
    } catch (error) {
      console.error("Failed to parse lobby manager message:", error);
    }
  };
  
  ws.onerror = (err) => {
    console.error("Lobby Manager WebSocket error:", err);
  };
  
  ws.onclose = (event) => {
    console.log('[LobbyManager] WebSocket closed, code:', event.code, 'reason:', event.reason);
    connectedState = false;
    
    // Only clear the global socket if it's the same one that closed
    if (globalSocket === ws) {
      globalSocket = null;
      globalUsername = null;
    }
  };
  
  return ws;
}

function send(event: any) {
  const socket = globalSocket;
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(event));
  } else {
    console.error('[LobbyManager] Cannot send event - WebSocket not ready:', socket?.readyState);
    
    // Retry sending the event after a short delay if connection is being established
    if (socket && socket.readyState === WebSocket.CONNECTING) {
      console.log('[LobbyManager] Connection in progress, retrying in 500ms...');
      setTimeout(() => {
        if (globalSocket && globalSocket.readyState === WebSocket.OPEN) {
          globalSocket.send(JSON.stringify(event));
        } else {
          console.error('[LobbyManager] Connection still not ready after retry');
        }
      }, 500);
    } else if (!socket) {
      console.log('[LobbyManager] No socket available, creating new connection...');
      // Create a new socket and retry
      getOrCreateSocket(globalUsername || 'Guest');
      setTimeout(() => {
        if (globalSocket && globalSocket.readyState === WebSocket.OPEN) {
          globalSocket.send(JSON.stringify(event));
        }
      }, 1000);
    }
  }
}

export function useLobbyManager({
  username,
  onEvent,
}: {
  username: string;
  onEvent: (event: LobbyEvent) => void;
}) {
  const [connected, setConnected] = useState(connectedState);
  const [matches, setMatches] = useState<LobbyMatch[]>(matchesState);

  useEffect(() => {
    // Add this component's event listener
    eventListeners.push(onEvent);
    
    // Get or create the global socket
    getOrCreateSocket(username);
    
    // Update local state to match global state
    setConnected(connectedState);
    setMatches(matchesState);
    
    // Set up an interval to sync state
    const syncInterval = setInterval(() => {
      setConnected(connectedState);
      setMatches(matchesState);
    }, 100);
    
    return () => {
      // Remove this component's event listener
      const index = eventListeners.indexOf(onEvent);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
      clearInterval(syncInterval);
    };
  }, [username, onEvent]);

  return {
    connected,
    matches,
    createMatch: (wager: number, timePerSide: number) => 
      send({ type: "create-match", username, wager, timePerSide }),
    joinMatch: (matchId: string) => 
      send({ type: "join-match", matchId, username }),
    cancelMatch: (matchId: string) => 
      send({ type: "cancel-match", matchId, username }),
    refreshMatches: () => {
      console.log('[LobbyManager] Sending refresh-matches request');
      send({ type: "refresh-matches", username });
    },
  };
} 