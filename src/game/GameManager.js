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
        this.lastItemId = 0;
        
        this.startItemSpawning();
    }

    // Configuração das paredes do jogo
    getWalls() {
        return [
            // Paredes externas
            { x: 0, y: 0, width: GAME_CONFIG.CANVAS_WIDTH, height: GAME_CONFIG.WALL_THICKNESS },
            { x: 0, y: GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.WALL_THICKNESS, width: GAME_CONFIG.CANVAS_WIDTH, height: GAME_CONFIG.WALL_THICKNESS },
            { x: 0, y: 0, width: GAME_CONFIG.WALL_THICKNESS, height: GAME_CONFIG.CANVAS_HEIGHT },
            { x: GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.WALL_THICKNESS, y: 0, width: GAME_CONFIG.WALL_THICKNESS, height: GAME_CONFIG.CANVAS_HEIGHT },
            
            // Barreiras internas
            { x: 150, y: 100, width: 100, height: GAME_CONFIG.WALL_THICKNESS },
            { x: 350, y: 200, width: 100, height: GAME_CONFIG.WALL_THICKNESS },
            { x: 200, y: 250, width: GAME_CONFIG.WALL_THICKNESS, height: 80 },
            { x: 400, y: 80, width: GAME_CONFIG.WALL_THICKNESS, height: 100 }
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

        // Verificar se a nova posição é válida
        if (this.collisionSystem.isValidPosition(newX, newY)) {
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
        
        return { moved: false };
    }

    // Verificar colisões com items
    checkItemCollisions(player) {
        for (let itemId in this.items) {
            const item = this.items[itemId];
            if (player.checkItemCollision(item)) {
                // Jogador coletou o item
                const points = player.addScore(item.value);
                const newAchievements = this.scoreSystem.updatePlayerScore(player.id, item.value, item.type);
                
                delete this.items[itemId];
                
                return {
                    itemId: itemId,
                    points: item.value,
                    totalScore: player.score,
                    achievements: newAchievements
                };
            }
        }
        return null;
    }

    // Gerar posição aleatória válida
    getValidRandomPosition() {
        let x, y;
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            x = Math.random() * (GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PLAYER_SIZE - 20) + 10;
            y = Math.random() * (GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PLAYER_SIZE - 20) + 10;
            attempts++;
        } while (!this.collisionSystem.isValidPosition(x, y) && attempts < maxAttempts);
        
        // Se não conseguiu encontrar posição válida, usar posição padrão
        if (attempts >= maxAttempts) {
            x = 50;
            y = 50;
        }
        
        return { x, y };
    }

    // Spawnar novo item
    spawnItem() {
        const position = this.getValidRandomPosition();
        const id = `item_${++this.lastItemId}_${Date.now()}`;
        const item = new Item(id, position.x, position.y);
        this.items[id] = item;
        return item;
    }

    // Iniciar spawn automático de items
    startItemSpawning() {
        this.itemSpawnTimer = setInterval(() => {
            this.spawnItem();
        }, GAME_CONFIG.ITEM_SPAWN_INTERVAL);
    }

    // Parar spawn de items
    stopItemSpawning() {
        if (this.itemSpawnTimer) {
            clearInterval(this.itemSpawnTimer);
            this.itemSpawnTimer = null;
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

    // Limpeza de items expirados (opcional)
    cleanupExpiredItems() {
        const expiredItems = Object.keys(this.items).filter(id => 
            this.items[id].isExpired()
        );
        
        expiredItems.forEach(id => delete this.items[id]);
        return expiredItems.length;
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