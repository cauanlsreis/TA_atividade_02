// CollisionSystem.js - Sistema de detecção de colisões

const GAME_CONFIG = require('../config/gameConfig');

class CollisionSystem {
    constructor(walls = []) {
        this.walls = walls;
    }

    // Verificar colisão com paredes
    checkWallCollision(x, y, width = GAME_CONFIG.PLAYER_SIZE, height = GAME_CONFIG.PLAYER_SIZE) {
        for (let wall of this.walls) {
            if (x < wall.x + wall.width &&
                x + width > wall.x &&
                y < wall.y + wall.height &&
                y + height > wall.y) {
                return true;
            }
        }
        return false;
    }

    // Verificar colisão entre dois objetos retangulares
    checkRectCollision(obj1, obj2, obj1Size = GAME_CONFIG.PLAYER_SIZE, obj2Size = GAME_CONFIG.ITEM_SIZE) {
        return obj1.x < obj2.x + obj2Size &&
               obj1.x + obj1Size > obj2.x &&
               obj1.y < obj2.y + obj2Size &&
               obj1.y + obj1Size > obj2.y;
    }

    // Verificar se posição está dentro dos limites do canvas
    isWithinBounds(x, y, width = GAME_CONFIG.PLAYER_SIZE, height = GAME_CONFIG.PLAYER_SIZE) {
        return x >= 0 && 
               y >= 0 && 
               x + width <= GAME_CONFIG.CANVAS_WIDTH && 
               y + height <= GAME_CONFIG.CANVAS_HEIGHT;
    }

    // Verificar se uma posição é válida (sem colisões e dentro dos limites)
    isValidPosition(x, y, width = GAME_CONFIG.PLAYER_SIZE, height = GAME_CONFIG.PLAYER_SIZE) {
        return this.isWithinBounds(x, y, width, height) && 
               !this.checkWallCollision(x, y, width, height);
    }

    // Atualizar paredes
    updateWalls(newWalls) {
        this.walls = newWalls;
    }
}

module.exports = CollisionSystem;