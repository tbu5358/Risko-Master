// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('SnakeRoyale client initializing...');
    
    // Connect to WebSocket server
    wsClient.connect();
    
    // Setup WebSocket event handlers
    wsClient.on('connected', () => {
        console.log('Connected to SnakeRoyale server');
        ui.showSuccess('Connected to server!');
        const token = localStorage.getItem('sr_token') || '';
        wsClient.send('connect', { token });
    });
    
    wsClient.on('disconnected', () => {
        console.log('Disconnected from SnakeRoyale server');
        ui.showError('Disconnected from server');
    });
    
    wsClient.on('error', (error) => {
        console.error('WebSocket error:', error);
        ui.showError('Connection error occurred');
    });
    
    // Auth/balance
    wsClient.on('connect_success', (data) => {
        ui.setUser({ userId: data.userId, username: data.username, walletBalance: data.walletBalance });
    });
    wsClient.on('connect_error', (data) => {
        ui.showError(data.error || 'Auth failed');
    });
    wsClient.on('balance_update', (data) => {
        ui.updateBalance(data.walletBalance);
    });

    // Game state handlers
    wsClient.on('game_state', (data) => {
        gameClient.handleGameState(data);
    });
    
    wsClient.on('player_update', (data) => {
        gameClient.handlePlayerUpdate(data);
    });
    
    wsClient.on('player_death', (data) => {
        gameClient.handlePlayerDeath(data);
    });
    
    wsClient.on('zone_update', (data) => {
        gameClient.handleZoneUpdate(data);
    });
    
    // Handle page unload
    window.addEventListener('beforeunload', () => {
        wsClient.disconnect();
        gameClient.cleanup();
    });
    
    console.log('SnakeRoyale client initialized successfully');
});
