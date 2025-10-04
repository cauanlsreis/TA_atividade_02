// Item.js - Classe para gerenciar items do jogo

const GAME_CONFIG = require('../config/gameConfig');

class Item {
    constructor(id, x, y, type = null) {
        this.id = id;
        this.x = x;
        this.y = y;
        
        // Distribuição dos tipos: 60% coin, 30% gem, 10% diamond
        if (!type) {
            const rand = Math.random();
            if (rand < 0.6) {
                this.type = 'coin';
            } else if (rand < 0.9) {
                this.type = 'gem';
            } else {
                this.type = 'diamond';
            }
        } else {
            this.type = type;
        }
        
        this.value = this.getItemValue();
        this.createdAt = Date.now();
        this.expiresAt = this.createdAt + GAME_CONFIG.ITEM_LIFESPAN;
    }

    // Determinar valor do item baseado no tipo
    getItemValue() {
        switch (this.type) {
            case 'coin':
                return GAME_CONFIG.ITEM_VALUES.COIN;
            case 'gem':
                return GAME_CONFIG.ITEM_VALUES.GEM;
            case 'diamond':
                return GAME_CONFIG.ITEM_VALUES.DIAMOND;
            default:
                return GAME_CONFIG.ITEM_VALUES.COIN;
        }
    }

    // Verificar se item expirou
    isExpired() {
        return Date.now() > this.expiresAt;
    }
    
    // Obter tempo restante em segundos
    getTimeRemaining() {
        const remaining = this.expiresAt - Date.now();
        return Math.max(0, Math.floor(remaining / 1000));
    }

    // Converter para objeto simples
    toJSON() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            type: this.type,
            value: this.value
        };
    }
}

module.exports = Item;