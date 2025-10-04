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
    ITEM_SPAWN_INTERVAL: 2000, // 2 segundos
    ITEM_LIFESPAN: 30000, // 30 segundos antes de expirar
    MIN_ITEMS: 5, // Mínimo de items na tela
    MAX_ITEMS: 12, // Máximo de items na tela
    ITEM_VALUES: {
        COIN: 10,
        GEM: 25,
        DIAMOND: 50
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
        COIN: '#f1c40f',        // Amarelo dourado para moedas (círculos)
        GEM: '#e74c3c',         // Vermelho para gemas (losangos)
        DIAMOND: '#9b59b6',     // Roxo para diamantes (estrelas)
        PLAYER_BORDER: '#2c3e50',
        HIGHLIGHT: '#e74c3c'
    }
};

module.exports = GAME_CONFIG;