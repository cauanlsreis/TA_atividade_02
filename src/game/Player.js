// Player.js - Classe para gerenciar jogadores

const GAME_CONFIG = require('../config/gameConfig');

class Player {
    constructor(id, name, color, x, y) {
        this.id = id;
        this.name = name || `Player_${id.substring(0, 4)}`;
        this.color = color || this.getRandomColor();
        this.x = x;
        this.y = y;
        this.score = 0;
        this.lastUpdate = Date.now();
        this.isOnline = true;
    }

    // Atualizar posição do jogador
    updatePosition(newX, newY) {
        this.x = newX;
        this.y = newY;
        this.lastUpdate = Date.now();
    }

    // Adicionar pontos ao jogador
    addScore(points) {
        this.score += points;
        return this.score;
    }

    // Verificar se o jogador colidiu com um item
    checkItemCollision(item) {
        return this.x < item.x + GAME_CONFIG.ITEM_SIZE &&
               this.x + GAME_CONFIG.PLAYER_SIZE > item.x &&
               this.y < item.y + GAME_CONFIG.ITEM_SIZE &&
               this.y + GAME_CONFIG.PLAYER_SIZE > item.y;
    }

    // Gerar cor aleatória
    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Converter para objeto simples para envio via socket
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            x: this.x,
            y: this.y,
            color: this.color,
            score: this.score,
            isOnline: this.isOnline
        };
    }

    // Marcar jogador como offline
    setOffline() {
        this.isOnline = false;
    }
}

module.exports = Player;