class GameClient {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.miniMap = null;
        this.miniMapCtx = null;
        
        this.playerId = null;
        this.playerName = null;
        this.gameState = null;
        this.players = new Map();
        this.foods = [];
        this.zone = null;
        
        this.camera = { x: 0, y: 0 };
        this.mousePos = { x: 0, y: 0 };
        this.keys = {};
        
        this.gameLoop = null;
        this.lastUpdateTime = 0;
        
        this.init();
    }

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.miniMap = document.getElementById('miniMap');
        this.miniMapCtx = this.miniMap.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.setupEventListeners();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        // Mouse movement
        this.canvas.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
            
            const rect = this.canvas.getBoundingClientRect();
            const worldX = this.camera.x + (e.clientX - rect.left);
            const worldY = this.camera.y + (e.clientY - rect.top);
            
            wsClient.send('player_move', {
                x: worldX,
                y: worldY
            });
        });

        // Keyboard
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space') {
                e.preventDefault();
                wsClient.send('player_boost', { boosting: true });
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            
            if (e.code === 'Space') {
                wsClient.send('player_boost', { boosting: false });
            }
        });

        // Emoji buttons
        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                wsClient.send('player_emoji', { emoji: btn.textContent });
            });
        });
    }

    startGame(playerId, playerName) {
        this.playerId = playerId;
        this.playerName = playerName;
        
        document.getElementById('gameContainer').classList.remove('hidden');
        
        this.gameLoop = setInterval(() => this.update(), 1000 / 60);
    }

    update() {
        this.clearCanvas();
        this.updateCamera();
        this.drawZone();
        this.drawFoods();
        this.drawPlayers();
        this.drawMiniMap();
        this.updateHUD();
    }

    clearCanvas() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    updateCamera() {
        const player = this.players.get(this.playerId);
        if (player) {
            this.camera.x = player.x - this.canvas.width / 2;
            this.camera.y = player.y - this.canvas.height / 2;
        }
    }

    drawZone() {
        if (!this.zone) return;

        const zoneX = this.zone.x - this.camera.x;
        const zoneY = this.zone.y - this.camera.y;
        const zoneRadius = this.zone.radius;

        // Draw danger zone
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw safe zone
        this.ctx.beginPath();
        this.ctx.arc(zoneX, zoneY, zoneRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
        this.ctx.fill();
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawFoods() {
        this.foods.forEach(food => {
            const x = food.x - this.camera.x;
            const y = food.y - this.camera.y;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ffd700';
            this.ctx.fill();
        });
    }

    drawPlayers() {
        this.players.forEach(player => {
            const x = player.x - this.camera.x;
            const y = player.y - this.camera.y;
            
            // Draw snake body
            this.ctx.beginPath();
            this.ctx.arc(x, y, player.size, 0, Math.PI * 2);
            this.ctx.fillStyle = player.color || '#00ff00';
            this.ctx.fill();
            
            // Draw name
            this.ctx.fillStyle = 'white';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(player.username, x, y - player.size - 10);
            
            // Draw emoji if any
            if (player.emoji) {
                this.ctx.font = '20px Arial';
                this.ctx.fillText(player.emoji, x + player.size + 10, y);
            }
        });
    }

    drawMiniMap() {
        if (!this.miniMapCtx) return;

        this.miniMapCtx.clearRect(0, 0, this.miniMap.width, this.miniMap.height);
        
        const mapScale = 0.1;
        const mapWidth = 4000 * mapScale;
        const mapHeight = 2000 * mapScale;
        
        // Draw map background
        this.miniMapCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.miniMapCtx.fillRect(0, 0, this.miniMap.width, this.miniMap.height);
        
        // Draw zone
        if (this.zone) {
            const zoneX = (this.zone.x * mapScale) - (this.camera.x * mapScale);
            const zoneY = (this.zone.y * mapScale) - (this.camera.y * mapScale);
            const zoneRadius = this.zone.radius * mapScale;
            
            this.miniMapCtx.beginPath();
            this.miniMapCtx.arc(zoneX, zoneY, zoneRadius, 0, Math.PI * 2);
            this.miniMapCtx.strokeStyle = '#00ff00';
            this.miniMapCtx.lineWidth = 1;
            this.miniMapCtx.stroke();
        }
        
        // Draw players
        this.players.forEach(player => {
            const x = (player.x * mapScale) - (this.camera.x * mapScale);
            const y = (player.y * mapScale) - (this.camera.y * mapScale);
            
            this.miniMapCtx.beginPath();
            this.miniMapCtx.arc(x, y, 2, 0, Math.PI * 2);
            this.miniMapCtx.fillStyle = player.id === this.playerId ? '#00ff00' : '#ff0000';
            this.miniMapCtx.fill();
        });
    }

    updateHUD() {
        // Update zone stage
        if (this.zone) {
            document.getElementById('zoneStage').textContent = this.zone.stage || 1;
        }
        
        // Update leaderboard
        const leaderboard = Array.from(this.players.values())
            .sort((a, b) => b.size - a.size)
            .slice(0, 10);
        
        const leaderboardDiv = document.getElementById('leaderboard');
        leaderboardDiv.innerHTML = leaderboard
            .map((player, index) => 
                `<div>${index + 1}. ${player.username} (${Math.floor(player.size)})</div>`
            ).join('');
    }

    handleGameState(data) {
        this.gameState = data.state;
        
        // Update players
        data.players.forEach(playerData => {
            this.players.set(playerData.id, playerData);
        });
        
        // Update foods
        this.foods = data.foods || [];
        
        // Update zone
        this.zone = data.zone;
    }

    handlePlayerUpdate(data) {
        if (data.player) {
            this.players.set(data.player.id, data.player);
        }
    }

    handlePlayerDeath(data) {
        this.players.delete(data.playerId);
        
        if (data.playerId === this.playerId) {
            this.endGame();
        }
    }

    handleZoneUpdate(data) {
        this.zone = data.zone;
    }

    endGame() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        document.getElementById('gameContainer').classList.add('hidden');
        document.getElementById('postMatchScreen').classList.remove('hidden');
    }

    cleanup() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        this.players.clear();
        this.foods = [];
        this.zone = null;
    }
}

// Create global game client
const gameClient = new GameClient();
