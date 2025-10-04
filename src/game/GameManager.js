// GameManager.js - Classe principal de gerenciamento do jogo

const Player = require('./Player');
const Item = require('./Item');
const CollisionSystem = require('./CollisionSystem');
const ScoreSystem = require('./ScoreSystem');
const GAME_CONFIG = require('../config/gameConfig');

class GameManager {
    constructor() {
        this.players = {};
        this.items = {};
        this.scoreSystem = new ScoreSystem();
        this.collisionSystem = new CollisionSystem(this.getWalls());
        this.itemSpawnTimer = null;
        this.itemCleanupTimer = null;
        this.lastItemId = 0;
        
        this.startItemSpawning();
        this.startItemCleanup();
        this.spawnInitialItems();
    }

    // Configuração das paredes do jogo (mapa navegável com espaços adequados)
    getWalls() {
        const MIN_PASSAGE = 40; // Espaço mínimo para passagem (jogador = 30px + margem)
        const WALL_SIZE = GAME_CONFIG.WALL_THICKNESS;
        
        return [
            // Paredes externas
            { x: 0, y: 0, width: GAME_CONFIG.CANVAS_WIDTH, height: WALL_SIZE },
            { x: 0, y: GAME_CONFIG.CANVAS_HEIGHT - WALL_SIZE, width: GAME_CONFIG.CANVAS_WIDTH, height: WALL_SIZE },
            { x: 0, y: 0, width: WALL_SIZE, height: GAME_CONFIG.CANVAS_HEIGHT },
            { x: GAME_CONFIG.CANVAS_WIDTH - WALL_SIZE, y: 0, width: WALL_SIZE, height: GAME_CONFIG.CANVAS_HEIGHT },
            
            // Layout navegável - Seção Superior
            { x: 60, y: 60, width: 100, height: WALL_SIZE },        // Barreira superior esquerda
            { x: 220, y: 40, width: WALL_SIZE, height: 70 },        // Divisor vertical esquerdo
            { x: 320, y: 60, width: 100, height: WALL_SIZE },       // Barreira superior central
            { x: 480, y: 40, width: WALL_SIZE, height: 70 },        // Divisor vertical direito
            
            // Seção Central Superior - com passagens largas
            { x: 80, y: 150, width: 80, height: WALL_SIZE },        // Barreira horizontal esquerda
            { x: 260, y: 130, width: WALL_SIZE, height: 50 },       // Divisor central pequeno
            { x: 340, y: 150, width: 100, height: WALL_SIZE },      // Barreira horizontal direita
            
            // Seção Central - Caminhos em Z com espaços adequados
            { x: 40, y: 210, width: 80, height: WALL_SIZE },        // Entrada esquerda
            { x: 200, y: 190, width: WALL_SIZE, height: 50 },       // Pilar central esquerdo
            { x: 320, y: 210, width: 80, height: WALL_SIZE },       // Barreira central
            { x: 480, y: 190, width: WALL_SIZE, height: 50 },       // Pilar central direito
            
            // Seção Central Inferior - espaços navegáveis
            { x: 60, y: 270, width: 70, height: WALL_SIZE },        // Barreira inferior esquerda
            { x: 200, y: 290, width: WALL_SIZE, height: 50 },       // Divisor vertical baixo esquerdo
            { x: 320, y: 270, width: 70, height: WALL_SIZE },       // Barreira inferior central
            { x: 460, y: 290, width: WALL_SIZE, height: 50 },       // Divisor vertical baixo direito
            
            // Seção Inferior - corredores finais amplos
            { x: 100, y: 350, width: 70, height: WALL_SIZE },       // Barreira final esquerda
            { x: 260, y: 330, width: WALL_SIZE, height: 30 },       // Pequeno obstáculo central
            { x: 380, y: 350, width: 80, height: WALL_SIZE }        // Barreira final direita
        ];
    }

    // Adicionar novo jogador
    addPlayer(id, name, color) {
        const position = this.getValidRandomPosition();
        const player = new Player(id, name, color, position.x, position.y);
        this.players[id] = player;
        this.scoreSystem.addPlayer(id, player.name);
        return player;
    }

    // Remover jogador
    removePlayer(id) {
        if (this.players[id]) {
            const playerName = this.players[id].name;
            delete this.players[id];
            this.scoreSystem.removePlayer(id);
            return playerName;
        }
        return null;
    }

    // Mover jogador
    movePlayer(id, direction) {
        const player = this.players[id];
        if (!player) return null;

        let newX = player.x;
        let newY = player.y;

        switch (direction) {
            case 'left':
                newX -= GAME_CONFIG.PLAYER_SPEED;
                break;
            case 'right':
                newX += GAME_CONFIG.PLAYER_SPEED;
                break;
            case 'up':
                newY -= GAME_CONFIG.PLAYER_SPEED;
                break;
            case 'down':
                newY += GAME_CONFIG.PLAYER_SPEED;
                break;
        }

        // Verificar se a nova posição é válida (paredes e limites)
        if (!this.collisionSystem.isValidPosition(newX, newY)) {
            return { moved: false };
        }

        // Verificar colisão com outros jogadores
        if (this.checkPlayerCollision(id, newX, newY)) {
            return { moved: false };
        }

        // Movimento válido - atualizar posição
        player.updatePosition(newX, newY);
        
        // Verificar colisão com items
        const collectedItem = this.checkItemCollisions(player);
        if (collectedItem) {
            return {
                moved: true,
                itemCollected: collectedItem,
                newScore: player.score
            };
        }
        
        return { moved: true, newScore: player.score };
    }

    // Verificar colisão com outros jogadores
    checkPlayerCollision(playerId, newX, newY) {
        for (let otherPlayerId in this.players) {
            if (otherPlayerId === playerId) continue;
            
            const otherPlayer = this.players[otherPlayerId];
            
            // Verificar sobreposição
            if (newX < otherPlayer.x + GAME_CONFIG.PLAYER_SIZE &&
                newX + GAME_CONFIG.PLAYER_SIZE > otherPlayer.x &&
                newY < otherPlayer.y + GAME_CONFIG.PLAYER_SIZE &&
                newY + GAME_CONFIG.PLAYER_SIZE > otherPlayer.y) {
                return true; // Colisão detectada
            }
        }
        return false;
    }

    // Verificar colisões com items
    checkItemCollisions(player) {
        for (let itemId in this.items) {
            const item = this.items[itemId];
            
            // Verificar se o item ainda existe e não expirou
            if (!item || item.isExpired()) {
                delete this.items[itemId];
                continue;
            }
            
            if (player.checkItemCollision(item)) {
                // Jogador coletou o item
                const points = player.addScore(item.value);
                const newAchievements = this.scoreSystem.updatePlayerScore(player.id, item.value, item.type);
                
                delete this.items[itemId];
                
                return {
                    itemId: itemId,
                    points: item.value,
                    totalScore: player.score,
                    achievements: newAchievements,
                    itemType: item.type
                };
            }
        }
        return null;
    }

    // Gerar posição aleatória válida
    getValidRandomPosition(objectSize = GAME_CONFIG.PLAYER_SIZE) {
        let x, y;
        let attempts = 0;
        const maxAttempts = 100;
        const margin = 20;
        
        do {
            x = Math.random() * (GAME_CONFIG.CANVAS_WIDTH - objectSize - margin * 2) + margin;
            y = Math.random() * (GAME_CONFIG.CANVAS_HEIGHT - objectSize - margin * 2) + margin;
            attempts++;
        } while (!this.collisionSystem.isValidPosition(x, y, objectSize, objectSize) && attempts < maxAttempts);
        
        // Se não conseguiu encontrar posição válida, tentar posições fixas
        if (attempts >= maxAttempts) {
            const safePosotions = [
                { x: 50, y: 50 },
                { x: GAME_CONFIG.CANVAS_WIDTH - 80, y: 50 },
                { x: 50, y: GAME_CONFIG.CANVAS_HEIGHT - 80 },
                { x: GAME_CONFIG.CANVAS_WIDTH - 80, y: GAME_CONFIG.CANVAS_HEIGHT - 80 },
                { x: GAME_CONFIG.CANVAS_WIDTH / 2, y: 50 },
                { x: GAME_CONFIG.CANVAS_WIDTH / 2, y: GAME_CONFIG.CANVAS_HEIGHT - 80 }
            ];
            
            for (let pos of safePosotions) {
                if (this.collisionSystem.isValidPosition(pos.x, pos.y, objectSize, objectSize)) {
                    return pos;
                }
            }
            
            // Último recurso
            return null;
        }
        
        return { x, y };
    }

    // Spawnar novo item
    spawnItem() {
        // Verificar se já temos muitos items
        if (Object.keys(this.items).length >= GAME_CONFIG.MAX_ITEMS) {
            return null;
        }
        
        const position = this.getValidRandomPosition(GAME_CONFIG.ITEM_SIZE);
        if (!position) return null;
        
        const id = `item_${++this.lastItemId}_${Date.now()}`;
        const item = new Item(id, position.x, position.y);
        this.items[id] = item;
        return item;
    }
    
    // Spawnar items iniciais
    spawnInitialItems() {
        for (let i = 0; i < GAME_CONFIG.MIN_ITEMS; i++) {
            this.spawnItem();
        }
    }

    // Iniciar spawn automático de items
    startItemSpawning() {
        this.itemSpawnTimer = setInterval(() => {
            // Só spawnar se estivermos abaixo do mínimo
            if (Object.keys(this.items).length < GAME_CONFIG.MIN_ITEMS) {
                this.spawnItem();
            }
        }, GAME_CONFIG.ITEM_SPAWN_INTERVAL);
    }
    
    // Iniciar limpeza automática de items
    startItemCleanup() {
        this.itemCleanupTimer = setInterval(() => {
            this.cleanupExpiredItems();
        }, 5000); // A cada 5 segundos
    }

    // Parar spawn de items
    stopItemSpawning() {
        if (this.itemSpawnTimer) {
            clearInterval(this.itemSpawnTimer);
            this.itemSpawnTimer = null;
        }
        if (this.itemCleanupTimer) {
            clearInterval(this.itemCleanupTimer);
            this.itemCleanupTimer = null;
        }
    }

    // Obter estado completo do jogo
    getGameState() {
        return {
            players: Object.fromEntries(
                Object.entries(this.players).map(([id, player]) => [id, player.toJSON()])
            ),
            items: Object.fromEntries(
                Object.entries(this.items).map(([id, item]) => [id, item.toJSON()])
            ),
            walls: this.getWalls(),
            globalScore: this.scoreSystem.globalScore
        };
    }

    // Limpeza de items expirados
    cleanupExpiredItems() {
        const expiredItems = [];
        
        for (let itemId in this.items) {
            const item = this.items[itemId];
            if (item.isExpired()) {
                expiredItems.push(itemId);
                delete this.items[itemId];
            }
        }
        
        // Spawnar novos items se estivermos abaixo do mínimo
        const currentItemCount = Object.keys(this.items).length;
        const itemsToSpawn = Math.min(
            GAME_CONFIG.MIN_ITEMS - currentItemCount,
            expiredItems.length
        );
        
        for (let i = 0; i < itemsToSpawn; i++) {
            this.spawnItem();
        }
        
        return {
            expired: expiredItems.length,
            spawned: itemsToSpawn,
            currentTotal: Object.keys(this.items).length
        };
    }

    // Resetar jogo
    reset() {
        this.players = {};
        this.items = {};
        this.scoreSystem.reset();
        this.lastItemId = 0;
    }
}

module.exports = GameManager;