// gameClient.js - Cliente principal do jogo

class GameClient {
    constructor() {
        this.socket = io();
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Estado do jogo
        this.players = {};
        this.items = {};
        this.walls = [];
        this.globalScore = {};
        this.myPlayerId = null;
        
        // Configurações
        this.config = {
            PLAYER_SIZE: 30,
            ITEM_SIZE: 15,
            COLORS: {
                WALL: '#2c3e50',
                COIN: '#f1c40f',
                GEM: '#e74c3c',
                DIAMOND: '#9b59b6',
                HIGHLIGHT: '#e74c3c',
                TEXT: '#2c3e50',
                SCORE: '#27ae60'
            }
        };
        
        this.initializeEventListeners();
    }

    // Inicializar todos os event listeners
    initializeEventListeners() {
        // Socket events
        this.socket.on('requestPlayerName', () => this.showPlayerSetup());
        this.socket.on('gameState', (gameData) => this.handleGameState(gameData));
        this.socket.on('newPlayer', (player) => this.handleNewPlayer(player));
        this.socket.on('playerMoved', (data) => this.handlePlayerMoved(data));
        this.socket.on('newItem', (item) => this.handleNewItem(item));
        this.socket.on('itemCollected', (data) => this.handleItemCollected(data));
        this.socket.on('playerDisconnected', (data) => this.handlePlayerDisconnected(data));
        this.socket.on('achievements', (achievements) => this.handleAchievements(achievements));
        this.socket.on('gameStateUpdate', (data) => this.handleGameStateUpdate(data));
        // Removido: itemsExpired event listener

        // Keyboard events
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
    }

    // Mostrar interface de configuração do jogador
    showPlayerSetup() {
        const setupDiv = document.createElement('div');
        setupDiv.id = 'playerSetup';
        setupDiv.className = 'player-setup';
        
        setupDiv.innerHTML = `
            <h3>Configuração do Jogador</h3>
            <div style="margin: 10px 0;">
                <label>Nome: </label>
                <input type="text" id="playerName" maxlength="15" placeholder="Seu nome">
            </div>
            <div style="margin: 10px 0;">
                <label>Cor: </label>
                <input type="color" id="playerColor" value="#3498db">
            </div>
            <button onclick="gameClient.joinGame()">Entrar no Jogo</button>
        `;
        
        document.body.appendChild(setupDiv);
        document.getElementById('playerName').focus();
        
        // Permitir enter para entrar
        document.getElementById('playerName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinGame();
        });
    }

    // Entrar no jogo
    joinGame() {
        const name = document.getElementById('playerName').value.trim() || 'Jogador';
        const color = document.getElementById('playerColor').value;
        
        this.socket.emit('setPlayerName', { name, color });
        document.getElementById('playerSetup').remove();
    }

    // Handlers para eventos do socket
    handleGameState(gameData) {
        this.players = gameData.players;
        this.items = gameData.items;
        this.walls = gameData.walls;
        this.globalScore = gameData.globalScore;
        this.myPlayerId = this.socket.id;
        this.render();
        this.updateScoreboard();
    }

    handleNewPlayer(player) {
        this.players[player.id] = player;
        this.showMessage(`${player.name} entrou no jogo!`, 'success');
        this.render();
    }

    handlePlayerMoved(data) {
        if (this.players[data.id]) {
            this.players[data.id].x = data.x;
            this.players[data.id].y = data.y;
            if (data.score !== undefined) {
                this.players[data.id].score = data.score;
            }
            this.render();
        }
    }

    handleNewItem(item) {
        this.items[item.id] = item;
        this.render();
    }

    handleItemCollected(data) {
        delete this.items[data.itemId];
        if (this.players[data.playerId]) {
            this.players[data.playerId].score = data.newScore;
        }
        this.globalScore = data.globalScore;
        
        // Verificar se há novo líder (só notifica quando há 2+ jogadores)
        if (data.isNewLeader && data.newLeader) {
            this.showMessage(`🏆 ${data.newLeader.name} é o novo líder com ${data.newLeader.score} pontos!`, 'success');
        }
        
        this.render();
        this.updateScoreboard();
    }

    handlePlayerDisconnected(data) {
        if (this.players[data.id]) {
            this.showMessage(`${data.name} saiu do jogo`, 'error');
            delete this.players[data.id];
            
            // Atualizar globalScore se fornecido
            if (data.globalScore) {
                this.globalScore = data.globalScore;
                this.updateScoreboard();
            }
            
            this.render();
        }
    }

    handleAchievements(achievements) {
        achievements.forEach(achievement => {
            this.showMessage(`🏆 ${achievement.message}`, 'info');
        });
    }
    
    handleGameStateUpdate(data) {
        if (data.items) {
            this.items = data.items;
            this.render();
        }
    }

    // Manipular teclas
    handleKeyDown(event) {
        const keyActions = {
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'ArrowUp': 'up',
            'ArrowDown': 'down'
        };

        if (keyActions[event.key]) {
            event.preventDefault();
            this.socket.emit('move', keyActions[event.key]);
        }
    }

    // Renderização completa
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawWalls();
        this.drawItems();
        this.drawPlayers();
    }

    drawWalls() {
        this.ctx.fillStyle = this.config.COLORS.WALL;
        this.walls.forEach(wall => {
            this.ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        });
    }

    drawItems() {
        Object.values(this.items).forEach(item => {
            const centerX = item.x + this.config.ITEM_SIZE / 2;
            const centerY = item.y + this.config.ITEM_SIZE / 2;
            const radius = this.config.ITEM_SIZE / 2;
            
            // Cor baseada no tipo
            let itemColor;
            switch(item.type) {
                case 'coin':
                    itemColor = this.config.COLORS.COIN;
                    break;
                case 'gem':
                    itemColor = this.config.COLORS.GEM;
                    break;
                case 'diamond':
                    itemColor = this.config.COLORS.DIAMOND;
                    break;
                default:
                    itemColor = this.config.COLORS.COIN;
            }
            
            this.ctx.fillStyle = itemColor;
            
            // Desenhar formas diferentes para cada tipo
            switch(item.type) {
                case 'coin':
                    // Círculo para moedas
                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY, radius - 2, 0, 2 * Math.PI);
                    this.ctx.fill();
                    
                    // Borda do círculo
                    this.ctx.strokeStyle = '#000';
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                    break;
                    
                case 'gem':
                    // Losango para gemas
                    this.ctx.beginPath();
                    this.ctx.moveTo(centerX, centerY - radius + 2);
                    this.ctx.lineTo(centerX + radius - 2, centerY);
                    this.ctx.lineTo(centerX, centerY + radius - 2);
                    this.ctx.lineTo(centerX - radius + 2, centerY);
                    this.ctx.closePath();
                    this.ctx.fill();
                    
                    // Borda do losango
                    this.ctx.strokeStyle = '#000';
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                    break;
                    
                case 'diamond':
                    // Estrela para diamantes
                    this.drawStar(centerX, centerY, 5, radius - 2, radius - 4);
                    
                    // Borda da estrela
                    this.ctx.strokeStyle = '#000';
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                    break;
            }
        });
    }
    
    // Função auxiliar para desenhar estrela
    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;
        
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
            
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
        }
        
        this.ctx.lineTo(cx, cy - outerRadius);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawPlayers() {
        Object.values(this.players).forEach((player) => {
            // Corpo do jogador
            this.ctx.fillStyle = player.color;
            this.ctx.fillRect(player.x, player.y, this.config.PLAYER_SIZE, this.config.PLAYER_SIZE);
            
            // Borda
            this.ctx.strokeStyle = this.config.COLORS.WALL;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(player.x, player.y, this.config.PLAYER_SIZE, this.config.PLAYER_SIZE);
            
            // Nome do jogador
            this.ctx.fillStyle = this.config.COLORS.TEXT;
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(player.name, player.x + 15, player.y - 5);
            
            // Score do jogador
            this.ctx.fillStyle = this.config.COLORS.SCORE;
            this.ctx.font = 'bold 10px Arial';
            this.ctx.fillText(`${player.score}pts`, player.x + 15, player.y + 45);
            
            // Destacar jogador local
            if (player.id === this.myPlayerId) {
                this.ctx.strokeStyle = this.config.COLORS.HIGHLIGHT;
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(player.x - 2, player.y - 2, 34, 34);
            }
        });
    }

    // Mostrar mensagens temporárias
    showMessage(text, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `notification ${type}`;
        messageDiv.textContent = text;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }

    // Atualizar placar
    updateScoreboard() {
        let scoreboardDiv = document.getElementById('scoreboard');
        if (!scoreboardDiv) {
            scoreboardDiv = document.createElement('div');
            scoreboardDiv.id = 'scoreboard';
            scoreboardDiv.className = 'scoreboard';
            document.body.appendChild(scoreboardDiv);
        }
        
        const sortedScores = Object.values(this.globalScore)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
        
        let html = '<h4>🏆 Top Jogadores</h4>';
        sortedScores.forEach((player, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎯';
            const isCurrentPlayer = player.name === (this.players[this.myPlayerId]?.name);
            html += `<div class="player-score ${isCurrentPlayer ? 'highlight' : ''}">
                ${medal} ${player.name}: ${player.score}pts
            </div>`;
        });
        
        scoreboardDiv.innerHTML = html;
    }
}

// Inicializar o jogo quando a página carregar
let gameClient;
document.addEventListener('DOMContentLoaded', () => {
    gameClient = new GameClient();
});