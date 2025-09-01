# SnakeRoyale - Production-Ready Multiplayer Battle Royale

A fully functional, production-ready Snake battle royale game with real-time multiplayer support using WebSockets.

## 🎮 Features

- **Real-time Multiplayer**: Up to 50 players per match
- **Battle Royale Mechanics**: Shrinking safe zone with damage outside
- **Betting System**: Place bets and win prize pools
- **Leaderboards**: Real-time rankings during matches
- **Progression System**: XP and coins system
- **Responsive Design**: Works on desktop and mobile
- **Smooth Animations**: 60 FPS gameplay with particle effects
- **Emoji Reactions**: Express yourself during gameplay

## 🏗️ Architecture (Current)

- **client/**: Vite + React app for menus, matchmaking, pages
  - `public/game/`: static Snake game (HTML/JS/CSS) embedded at runtime
- **server/**: TypeScript API + dedicated realtime WebSocket server
- **Realtime**: ws (websocket) protocol for matchmaking and in-game updates

## 🚀 Quick Start (Dev)

### Prerequisites
- Node.js (v14 or higher)
- npm

### Install

```bash
# in project root
cd server && npm i && cd ..
cd client && npm i && cd ..
```

### Run (two terminals)

```bash
# Terminal 1: start API + ws servers
cd server
npm run dev &          # API (ts-node src/server.ts)
npm run dev:ws &       # Realtime WS (ts-node src/realtime/index.ts)

# Terminal 2: start client
cd client
npm run dev            # http://localhost:5175
```

Then open http://localhost:5175 and click Join Game → Find Match.

## 🎯 How to Play

1. **Join a Lobby**: Enter your username and join the lobby
2. **Place Bets**: Choose your bet amount (optional)
3. **Get Ready**: Click ready when you're prepared
4. **Survive**: Avoid the shrinking zone and other players
5. **Win**: Be the last snake standing to win the prize pool

## 🎮 Controls

- **Mouse**: Move your snake
- **Space**: Boost (consumes health)
- **Number Keys**: Send emoji reactions

## 📁 Project Structure (Cleaned)

```
SnakeRoyale/
├── client/
│   ├── index.html               # Vite entry
│   ├── public/
│   │   └── game/                # Static embedded game (HTML/JS/CSS only)
│   └── src/
│       ├── App.tsx
│       ├── lib/ws.ts            # WebSocket client
│       ├── pages/
│       │   ├── Index.tsx        # Main menu/lobby
│       │   └── Play.tsx         # Iframe loader of public/game
│       └── components/
│           ├── MatchmakingModal.tsx
│           └── MenuBackground.tsx
├── server/
│   ├── src/
│   │   ├── server.ts            # REST + health
│   │   └── realtime/            # ws realtime server + managers/loop
│   └── tsconfig.json
└── README.md
```

Notes
- `client/public/game` contains only static assets; build configs and node_modules for the old standalone game were removed.
- The React app handles UI and routes; the actual canvas game is embedded at `/play`.

## 🔧 Development

### Server Configuration
The realtime server runs on port 8083 by default. You can change this via `RT_PORT` or in `server/realtime/index.ts`.

### Game Constants
Key game parameters can be adjusted in `server/server.js`:
- `WORLD_WIDTH`: Game world width (4000)
- `WORLD_HEIGHT`: Game world height (2000)
- `MAX_PLAYERS`: Maximum players per match (50)
- `GAME_TICK_RATE`: Server update rate (60 FPS)
- `ZONE_SHRINK_INTERVAL`: Zone shrink timing (30s)

### Client Configuration
WebSocket connection settings in `client/js/websocket.js`:
- Default server: `ws://localhost:8083`
- Auto-reconnect enabled

## 🐛 Troubleshooting

### Common Issues

1. **"WebSocket connection failed"**
   - Ensure realtime server is running on port 8083
   - Check firewall settings
   - Verify WebSocket URL in client

2. **"Cannot connect to server"**
   - Start realtime server with `npm run dev:ws` in server directory
   - Check if port 8083 is already in use

3. **"Game not starting"**
   - Ensure at least 2 players are in lobby
   - Check if all players are marked as ready

## 🚀 Production Deployment

### Server Deployment
```bash
# Install production dependencies
cd server
npm install --production

# Start server
NODE_ENV=production node server.js
```

### Client Deployment
- Serve `client/` directory with any HTTP server
- Configure reverse proxy for WebSocket connections
- Enable HTTPS for secure WebSocket (wss://)

## 🎨 Customization

### Adding New Emojis
Edit `client/js/ui.js` to add new emoji reactions.

### Modifying Game Rules
Update collision detection and zone logic in `server/server.js`.

### Custom Skins
Add new player appearance options in `client/css/styles.css`.

## 📊 Performance

- **Server**: Handles 50 concurrent players efficiently
- **Client**: 60 FPS on modern browsers
- **Network**: Optimized WebSocket messages (~1KB per update)
- **Memory**: Low memory footprint with efficient data structures

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use for any purpose.

## 🆘 Support

For issues and questions:
- Check the troubleshooting section
- Review server logs for errors
- Ensure all dependencies are installed

---

**Happy Gaming!** 🐍👑
