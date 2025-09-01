import { useEffect, useRef, useState } from "react";

export type GameEvent =
  | { type: "move"; from: string; to: string }
  | { type: "resign"; from: "white" | "black" }
  | { type: "draw" }
  | { type: "start"; matchId: string; timePerSide: number; wager: number; color: "white" | "black" }
  | { type: "chat"; from: "white" | "black"; message: string }
  | { type: "rematch-request"; from: "white" | "black" }
  | { type: "rematch-accept"; from: "white" | "black" }
  | { type: "rematch-deny"; from: "white" | "black" }
  | { type: "typing"; from: "white" | "black" }
  | { type: "lobby-joined"; username: string }
  | { type: "lobby-start"; countdown: number }
  | { type: "user-joined"; username: string }
  | { type: "lobby-chat"; username: string; message: string; timestamp: string }
  | { type: "lobby-player-ready"; username: string; color: "white" | "black" }
  | { type: "lobby-both-ready" }
  | { type: "lobby-match-starting" };

export function useGameSocket({
  matchId,
  myColor,
  onEvent,
  username = "Guest",
}: {
  matchId: string;
  myColor: "white" | "black";
  onEvent: (event: GameEvent) => void;
  username?: string;
}) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!matchId) return;
    const ws = new window.WebSocket("ws://localhost:8081");
    socketRef.current = ws;
    ws.onopen = () => {
      setConnected(true);
      ws.send(
        JSON.stringify({ type: "join", matchId, username })
      );
    };
    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        onEvent(data);
      } catch {}
    };
    ws.onerror = (err) => {
      // Optionally handle errors
    };
    return () => {
      ws.close();
    };
  }, [matchId, username]); // Removed onEvent dependency to prevent reconnections

  function send(event: GameEvent) {
    if (socketRef.current && socketRef.current.readyState === 1) {
      socketRef.current.send(JSON.stringify(event));
    }
  }
  return {
    connected,
    sendMove: (from: string, to: string) => send({ type: "move", from, to }),
    sendResign: (from: "white" | "black") => send({ type: "resign", from }),
    sendDraw: () => send({ type: "draw" }),
    sendStart: (matchId: string, timePerSide: number, wager: number, color: "white" | "black") =>
      send({ type: "start", matchId, timePerSide, wager, color }),
    sendChat: (from: "white" | "black", message: string) => send({ type: "chat", from, message }),
    sendRematchRequest: (from: "white" | "black") => send({ type: "rematch-request", from }),
    sendRematchAccept: (from: "white" | "black") => send({ type: "rematch-accept", from }),
    sendRematchDeny: (from: "white" | "black") => send({ type: "rematch-deny", from }),
    sendTyping: (from: "white" | "black") => send({ type: "typing", from }),
    sendLobbyJoined: (username: string) => send({ type: "lobby-joined", username }),
    sendLobbyStart: (countdown: number) => send({ type: "lobby-start", countdown }),
    sendLobbyChat: (username: string, message: string) => send({ type: "lobby-chat", username, message, timestamp: new Date().toISOString() }),
    sendLobbyPlayerReady: (username: string, color: "white" | "black") => send({ type: "lobby-player-ready", username, color }),
    sendLobbyBothReady: () => send({ type: "lobby-both-ready" }),
    sendLobbyMatchStarting: () => send({ type: "lobby-match-starting" }),
  };
} 