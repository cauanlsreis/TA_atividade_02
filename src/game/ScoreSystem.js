// ScoreSystem.js - Sistema de gerenciamento de pontuação

class ScoreSystem {
    constructor() {
        this.globalScore = {};
        this.achievements = {};
        this.currentLeader = null; // Rastrear líder atual
    }

    // Adicionar jogador ao sistema de pontuação
    addPlayer(playerId, playerName) {
        if (!this.globalScore[playerId]) {
            this.globalScore[playerId] = {
                name: playerName,
                score: 0,
                itemsCollected: 0,
                coinsCollected: 0,
                gemsCollected: 0,
                joinedAt: Date.now()
            };
        }
    }

    // Atualizar pontuação do jogador
    updatePlayerScore(playerId, points, itemType) {
        if (this.globalScore[playerId]) {
            this.globalScore[playerId].score += points;
            this.globalScore[playerId].itemsCollected++;
            
            if (itemType === 'coin') {
                this.globalScore[playerId].coinsCollected++;
            } else if (itemType === 'gem') {
                this.globalScore[playerId].gemsCollected++;
            }

            // Verificar mudança de liderança
            this.updateLeadership();

            // Verificar conquistas e retorná-las
            return this.checkAchievements(playerId);
        }
        return [];
    }

    // Verificar e atualizar liderança
    updateLeadership() {
        const topPlayers = this.getTopPlayers(1);
        const newLeader = topPlayers.length > 0 ? topPlayers[0] : null;
        
        // Se há um novo líder diferente do atual
        if (newLeader && (!this.currentLeader || this.currentLeader.name !== newLeader.name)) {
            this.currentLeader = newLeader;
            return true; // Mudança de liderança
        }
        
        return false; // Sem mudança
    }

    // Verificar se deve notificar sobre liderança (apenas com 2+ jogadores)
    shouldNotifyLeadership() {
        const playerCount = Object.keys(this.globalScore).length;
        return playerCount >= 2;
    }

    // Obter líder atual
    getCurrentLeader() {
        return this.currentLeader;
    }

    // Verificar conquistas
    checkAchievements(playerId) {
        const playerStats = this.globalScore[playerId];
        if (!playerStats) return [];

        const newAchievements = [];

        // Primeira coleta
        if (playerStats.itemsCollected === 1 && !this.achievements[playerId]?.firstItem) {
            newAchievements.push({ type: 'firstItem', message: 'Primeira coleta!' });
        }

        // 10 items coletados
        if (playerStats.itemsCollected === 10 && !this.achievements[playerId]?.collector) {
            newAchievements.push({ type: 'collector', message: 'Colecionador - 10 items!' });
        }

        // 100 pontos
        if (playerStats.score >= 100 && !this.achievements[playerId]?.centurion) {
            newAchievements.push({ type: 'centurion', message: 'Centurião - 100 pontos!' });
        }

        // Atualizar conquistas do jogador
        if (!this.achievements[playerId]) {
            this.achievements[playerId] = {};
        }

        newAchievements.forEach(achievement => {
            this.achievements[playerId][achievement.type] = true;
        });

        return newAchievements;
    }

    // Obter ranking dos jogadores
    getTopPlayers(limit = 5) {
        return Object.values(this.globalScore)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    // Remover jogador
    removePlayer(playerId) {
        // Se o líder saiu, atualizar liderança
        if (this.currentLeader && this.globalScore[playerId] && 
            this.currentLeader.name === this.globalScore[playerId].name) {
            this.currentLeader = null;
        }
        
        delete this.globalScore[playerId];
        delete this.achievements[playerId];
        
        // Atualizar liderança após remoção
        this.updateLeadership();
    }

    // Obter estatísticas completas do jogador
    getPlayerStats(playerId) {
        return {
            ...this.globalScore[playerId],
            achievements: this.achievements[playerId] || {}
        };
    }

    // Resetar pontuações (para modo desenvolvedor)
    reset() {
        this.globalScore = {};
        this.achievements = {};
        this.currentLeader = null;
    }
}

module.exports = ScoreSystem;