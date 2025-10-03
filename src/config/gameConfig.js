// gameConfig.js - Configurações centralizadas do jogo

const GAME_CONFIG = {
    // Configurações do canvas
    CANVAS_WIDTH: 600,
    CANVAS_HEIGHT: 400,
    
    // Configurações dos jogadores
    PLAYER_SIZE: 30,
    PLAYER_SPEED: 5,
    MAX_PLAYERS: 10,
    
    // Configurações dos items
    ITEM_SIZE: 15,
    ITEM_SPAWN_INTERVAL: 3000, // 3 segundos
    ITEM_VALUES: {
        COIN: 10,
        GEM: 25
    },
    
    // Configurações das paredes
    WALL_THICKNESS: 10,
    
    // Configurações de rede
    DELTA_UPDATE_THRESHOLD: 1, // pixels
    
    // Configurações de UI
    MAX_SCOREBOARD_ENTRIES: 5,
    MESSAGE_DURATION: 3000,
    
    // Cores padrão
    COLORS: {
        WALL: '#2c3e50',
        BACKGROUND: '#ecf0f1',
        COIN: '#f1c40f',
        GEM: '#e74c3c',
        PLAYER_BORDER: '#2c3e50',
        HIGHLIGHT: '#e74c3c'
    }
};

module.exports = GAME_CONFIG;