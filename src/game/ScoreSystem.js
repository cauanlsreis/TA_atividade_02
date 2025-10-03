// ScoreSystem.js - Sistema de gerenciamento de pontuação

class ScoreSystem {
    constructor() {
        this.globalScore = {};
        this.achievements = {};
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

            // Verificar conquistas
            this.checkAchievements(playerId);
        }
        return this.globalScore[playerId]?.score || 0;
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
        delete this.globalScore[playerId];
        delete this.achievements[playerId];
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
    }
}

module.exports = ScoreSystem;