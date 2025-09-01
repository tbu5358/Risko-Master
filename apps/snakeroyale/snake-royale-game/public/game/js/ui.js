class UI {
    constructor() {
        this.currentScreen = 'mainMenu';
        this.matchCountdown = 25;
        this.lobbyCountdown = 30;
        this.selectedBet = 0;
        this.players = [];
        this.isReady = false;
        this.user = { userId: null, username: 'Guest', walletBalance: 0 };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startMatchCountdown();
    }

    setupEventListeners() {
        // Main menu
        document.getElementById('playButton').addEventListener('click', () => {
            this.showScreen('lobby');
        });

        // Lobby
        document.querySelectorAll('.bet-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.bet-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedBet = parseInt(btn.dataset.bet);
                // Send join_match
                wsClient.send('join_match', { entryFee: this.selectedBet });
                this.showScreen('lobby');
            });
        });

        document.getElementById('readyButton').addEventListener('click', () => {
            // Cancel search per spec
            wsClient.send('match_cancel', {});
        });

        document.getElementById('usernameInput').addEventListener('input', (e) => {
            this.updateUsername(e.target.value);
        });

        // Post match
        document.getElementById('playAgainButton').addEventListener('click', () => {
            this.showScreen('lobby');
        });

        document.getElementById('mainMenuButton').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });

        // WebSocket events
        wsClient.on('lobby_update', (data) => {
            this.updateLobby(data);
        });
        wsClient.on('game_start', (data) => {
            this.startGame(data);
        });
        wsClient.on('game_end', (data) => {
            this.endGame(data);
        });
    }

    showScreen(screen) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        
        // Show target screen
        const targetScreen = document.getElementById(screen + 'Screen');
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            this.currentScreen = screen;
        }
    }

    // Spec helpers
    setUser({ userId, username, walletBalance }) {
        this.user = { userId, username, walletBalance };
        const balanceEl = document.querySelector('#mainMenu .text-2xl.font-bold.text-yellow-400');
        if (balanceEl) balanceEl.textContent = `💰 ${walletBalance.toLocaleString()}`;
    }

    updateBalance(walletBalance) {
        this.user.walletBalance = walletBalance;
        const balanceEl = document.querySelector('#mainMenu .text-2xl.font-bold.text-yellow-400');
        if (balanceEl) balanceEl.textContent = `💰 ${walletBalance.toLocaleString()}`;
    }

    onMatchFound(data) {
        // Transition could show a matchmaking -> game animation
        this.startGame({ playerId: this.user.userId, playerName: this.user.username });
    }

    onMatchCancelled() {
        this.showScreen('mainMenu');
        this.showSuccess('Search cancelled');
    }

    onMatchEnd({ placement, winnings, newBalance }) {
        this.showScreen('postMatch');
        document.getElementById('finalRank').textContent = placement || 1;
        document.getElementById('winnings').textContent = winnings || 0;
        this.updateBalance(newBalance || this.user.walletBalance);
    }

    onLeaderboardData({ players }) {
        // Implement when Leaderboard page markup is added
        console.log('Leaderboard data', players);
    }

    onProfileData({ stats }) {
        // Implement when Profile page markup is added
        console.log('Profile stats', stats);
    }

    startMatchCountdown() {
        const countdownInterval = setInterval(() => {
            this.matchCountdown--;
            document.getElementById('matchCountdown').textContent = this.matchCountdown;
            
            if (this.matchCountdown <= 0) {
                clearInterval(countdownInterval);
                this.showScreen('lobby');
            }
        }, 1000);
    }

    updateLobby(data) {
        this.players = data.players || [];
        this.updatePlayerList();
        this.updateLobbyCountdown(data.countdown || 30);
    }

    updatePlayerList() {
        const playerList = document.getElementById('playerList');
        playerList.innerHTML = '';
        
        this.players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = `player-item ${player.ready ? 'player-ready' : ''}`;
            playerDiv.innerHTML = `
                <span>${player.username}</span>
                <span>${player.ready ? '✅' : '⏳'}</span>
            `;
            playerList.appendChild(playerDiv);
        });
    }

    updateLobbyCountdown(countdown) {
        document.getElementById('lobbyCountdown').textContent = countdown;
    }

    toggleReady() {
        this.isReady = !this.isReady;
        const button = document.getElementById('readyButton');
        
        if (this.isReady) {
            button.textContent = 'Not Ready';
            button.classList.remove('bg-green-600', 'hover:bg-green-700');
            button.classList.add('bg-red-600', 'hover:bg-red-700');
        } else {
            button.textContent = 'Ready';
            button.classList.remove('bg-red-600', 'hover:bg-red-700');
            button.classList.add('bg-green-600', 'hover:bg-green-700');
        }
        
        wsClient.send('player_ready', { ready: this.isReady });
    }

    updateUsername(username) {
        wsClient.send('player_username', { username });
    }

    startGame(data) {
        this.showScreen('game');
        gameClient.startGame(data.playerId, data.playerName);
    }

    endGame(data) {
        this.showScreen('postMatch');
        
        // Update post match stats
        document.getElementById('finalRank').textContent = data.rank || 1;
        document.getElementById('finalScore').textContent = data.score || 0;
        document.getElementById('winnings').textContent = data.winnings || 0;
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg';
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg';
        successDiv.textContent = message;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}

// Create global UI instance
const ui = new UI();
