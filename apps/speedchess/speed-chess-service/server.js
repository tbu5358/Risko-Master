const WebSocket = require('ws');

// Create WebSocket server with minimal logging
const wss = new WebSocket.Server({ 
  port: 8081,
  // Disable built-in logging
  clientTracking: false
});

const matches = {}; // matchId -> Set of ws
const lobbyClients = new Set(); // Set of lobby manager clients
const availableMatches = new Map(); // matchId -> match data


// Cleanup old matches every 30 seconds
setInterval(() => {
  const now = Date.now();
  const maxAge = 2 * 60 * 1000; // 2 minutes
  
  for (const [matchId, match] of availableMatches.entries()) {
    if (now - match.createdAt > maxAge) {
      console.log('[Server] Removing old match:', matchId);
      availableMatches.delete(matchId);
      
      // Broadcast removal to all lobby clients
      broadcastToLobbyClients({
        type: 'match-removed',
        matchId: matchId
      });
    }
  }
}, 30 * 1000); // Check every 30 seconds

wss.on('connection', function connection(ws) {
  console.log('[Server] New WebSocket connection established');
  
  ws.on('message', function incoming(message) {
    let data;
    try {
      data = JSON.parse(message);
    } catch (error) {
      console.error('[Server] Failed to parse message:', error);
      return;
    }
    
    console.log('[Server] Received message from', ws.username || 'unknown user:', data);
    
    // Handle lobby manager events
    if (data.type === 'join-lobby-manager') {
      console.log('[Server] Lobby manager client joined:', data.username);
      lobbyClients.add(ws);
      ws.isLobbyClient = true;
      ws.username = data.username;
      
      // Send current matches to the new client
      const matchesArray = Array.from(availableMatches.values());
      console.log('[Server] Sending', matchesArray.length, 'matches to new client');
      ws.send(JSON.stringify({
        type: 'lobby-matches-update',
        matches: matchesArray
      }));
    }
    // Handle match creation
    else if (data.type === 'create-match') {
      console.log('[Server] Creating match:', data);
      const matchId = generateMatchId();
      const match = {
        id: matchId,
        playerWhite: data.username,
        wager: data.wager,
        timePerSide: data.timePerSide,
        waiting: true,
        state: "waiting",
        createdAt: Date.now(),
        hasActivePlayers: true
      };
      
      console.log('[Server] Generated match:', match);
      availableMatches.set(matchId, match);
      
      console.log('[Server] Broadcasting to', lobbyClients.size, 'lobby clients');
      // Broadcast to all lobby clients
      broadcastToLobbyClients({
        type: 'match-created',
        match: match
      });
      
      console.log('[Server] Sending confirmation to creator');
      // Send confirmation to creator
      ws.send(JSON.stringify({
        type: 'match-created',
        match: match
      }));
    }
    // Handle match joining
    else if (data.type === 'join-match') {
      console.log('[Server] Joining match:', data);
      const match = availableMatches.get(data.matchId);
      if (match && !match.playerBlack && match.hasActivePlayers !== false) {
        match.playerBlack = data.username;
        match.waiting = false;
        
        // Broadcast to all lobby clients
        broadcastToLobbyClients({
          type: 'match-joined',
          matchId: data.matchId,
          playerBlack: data.username
        });
        
        // Send confirmation to joiner
        ws.send(JSON.stringify({
          type: 'match-joined',
          matchId: data.matchId,
          playerBlack: data.username
        }));
        
        // Also send lobby-opponent-joined event to trigger countdown for creator
        if (matches[data.matchId]) {
          broadcastToOthers(data.matchId, ws, { 
            type: 'lobby-opponent-joined', 
            username: data.username 
          });
          
          // Also send the event to the joiner so they get synchronized countdown
          ws.send(JSON.stringify({
            type: 'lobby-opponent-joined',
            username: data.username
          }));
        }
      }
    }
    // Handle match cancellation
    else if (data.type === 'cancel-match') {
      console.log('[Server] Cancelling match:', data);
      const match = availableMatches.get(data.matchId);
      if (match && match.playerWhite === data.username) {
        availableMatches.delete(data.matchId);
        
        // Broadcast to all lobby clients
        broadcastToLobbyClients({
          type: 'match-removed',
          matchId: data.matchId
        });
      }
    }
    // Handle refresh matches
    else if (data.type === 'refresh-matches') {
      const matchesArray = Array.from(availableMatches.values());
      ws.send(JSON.stringify({
        type: 'lobby-matches-update',
        matches: matchesArray
      }));
    }
    // Handle lobby join
    else if (data.type === 'join-lobby') {
      console.log('[Server] Player joining lobby:', { matchId: data.matchId, username: data.username });
      ws.matchId = data.matchId;
      ws.username = data.username;
      if (!matches[data.matchId]) matches[data.matchId] = new Set();
      matches[data.matchId].add(ws);
      console.log('[Server] Lobby clients:', { matchId: data.matchId, clientCount: matches[data.matchId].size });
      
      // Notify others that a player joined the lobby
      broadcastToOthers(data.matchId, ws, { 
        type: 'lobby-opponent-joined', 
        username: data.username 
      });
    }

    // Handle lobby cancel
    else if (data.type === 'lobby-cancel') {
      console.log('[Server] Lobby cancelled:', { matchId: ws.matchId, username: data.username });
      
      // Remove match from available matches
      const match = availableMatches.get(ws.matchId);
      if (match) {
        console.log('[Server] Removing cancelled match:', ws.matchId);
        availableMatches.delete(ws.matchId);
        
        // Broadcast removal to all lobby clients
        broadcastToLobbyClients({
          type: 'match-removed',
          matchId: ws.matchId
        });
      }
    }
    // Handle game join (existing functionality)
    else if (data.type === 'join') {
      console.log('[Server] Player joining game:', { matchId: data.matchId, username: data.username });
      ws.matchId = data.matchId;
      ws.username = data.username;
      if (!matches[ws.matchId]) matches[ws.matchId] = new Set();
      matches[ws.matchId].add(ws);
      console.log('[Server] Match clients:', { matchId: ws.matchId, clientCount: matches[ws.matchId].size });
      // Notify others (but not the joining user)
      broadcastToOthers(ws.matchId, ws, { type: 'user-joined', username: data.username });
      console.log('[Server] Sent user-joined to other clients');
    }
    // Handle resign events
    else if (data.type === 'resign') {
      console.log('[Server] Player resigning:', { matchId: ws.matchId, username: ws.username, resignedBy: data.from });
      
      // Update the match data to include resignedBy field
      const match = availableMatches.get(ws.matchId);
      if (match) {
        match.resignedBy = data.from;
        match.state = "ended";
        console.log('[Server] Updated match with resignation:', { matchId: ws.matchId, resignedBy: data.from });
      }
      
      // Broadcast the resign event to all players in the match
      broadcast(ws.matchId, data);
    }
    // Broadcast all other events to the match
    else if (ws.matchId && matches[ws.matchId]) {
      broadcast(ws.matchId, data);
    }
  });

  ws.on('close', function () {
    if (ws.isLobbyClient) {
      lobbyClients.delete(ws);
    }
    if (ws.matchId && matches[ws.matchId]) {
      matches[ws.matchId].delete(ws);
      if (matches[ws.matchId].size === 0) {
        delete matches[ws.matchId];
        
        // Mark match as having no active players
        const match = availableMatches.get(ws.matchId);
        if (match) {
          match.hasActivePlayers = false;
          console.log('[Server] Marked match as inactive:', ws.matchId);
          
          // Broadcast update to all lobby clients
          broadcastToLobbyClients({
            type: 'match-updated',
            match: match
          });
        }
      }
    }
  });

  // Handle errors silently to prevent logging
  ws.on('error', function (error) {
    // Silently handle WebSocket errors
  });
});

function broadcast(matchId, data) {
  if (!matches[matchId]) return;
  
  const message = JSON.stringify(data);
  const clients = matches[matchId];
  
  // Use for...of for better performance
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (error) {
        // Silently handle send errors
      }
    }
  }
}

function broadcastToOthers(matchId, excludeWs, data) {
  if (!matches[matchId]) return;
  
  const message = JSON.stringify(data);
  const clients = matches[matchId];
  let sentCount = 0;
  
  // Use for...of for better performance
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN && client !== excludeWs) {
      try {
        client.send(message);
        sentCount++;
      } catch (error) {
        // Silently handle send errors
      }
    }
  }
  console.log('[Server] broadcastToOthers sent to', sentCount, 'clients (excluded joining user)');
}

function broadcastToLobbyClients(data) {
  const message = JSON.stringify(data);
  let sentCount = 0;
  
  for (const client of lobbyClients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
        sentCount++;
      } catch (error) {
        // Silently handle send errors
      }
    }
  }
  console.log('[Server] broadcastToLobbyClients sent to', sentCount, 'clients');
}

function generateMatchId() {
  return 'match_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Minimal startup message
console.log('SpeedChess server running on ws://localhost:8081'); 