// Item.js - Classe para gerenciar items do jogo

const GAME_CONFIG = require('../config/gameConfig');

class Item {
    constructor(id, x, y, type = null) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.type = type || (Math.random() > 0.5 ? 'coin' : 'gem');
        this.value = this.getItemValue();
        this.createdAt = Date.now();
    }

    // Determinar valor do item baseado no tipo
    getItemValue() {
        switch (this.type) {
            case 'coin':
                return GAME_CONFIG.ITEM_VALUES.COIN;
            case 'gem':
                return GAME_CONFIG.ITEM_VALUES.GEM;
            default:
                return GAME_CONFIG.ITEM_VALUES.COIN;
        }
    }

    // Verificar se item deve expirar (opcional - para items temporários)
    isExpired(maxAge = 30000) { // 30 segundos
        return Date.now() - this.createdAt > maxAge;
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