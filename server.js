// server.js - Servidor principal organizado

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Importar classes do jogo
const GameManager = require('./src/game/GameManager');
const Utils = require('./src/utils/utils');

// Configurar Express e Socket.IO
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Servir arquivos estáticos
app.use(express.static("public"));

// Criar instância do gerenciador do jogo
const gameManager = new GameManager();

// Middleware para logs
app.use((req, res, next) => {
    Utils.log(`${req.method} ${req.url}`, 'HTTP');
    next();
});

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para estatísticas do jogo (API)
app.get('/api/stats', (req, res) => {
    const stats = {
        playersOnline: Object.keys(gameManager.players).length,
        itemsAvailable: Object.keys(gameManager.items).length,
        topPlayers: gameManager.scoreSystem.getTopPlayers(10),
        serverUptime: process.uptime()
    };
    res.json(stats);
});

// Socket.IO - Gerenciamento de conexões
io.on('connection', (socket) => {
    Utils.log(`Novo jogador conectado: ${socket.id}`, 'SOCKET');

    // Solicitar configuração do jogador
    socket.emit('requestPlayerName');

    // Configurar jogador
    socket.on('setPlayerName', (data) => {
        try {
            // Validar dados de entrada
            const playerName = Utils.sanitizeString(data.name) || `Player_${socket.id.substring(0, 4)}`;
            const playerColor = Utils.validateColor(data.color) ? data.color : Utils.getRandomColor();

            // Adicionar jogador ao jogo
            const player = gameManager.addPlayer(socket.id, playerName, playerColor);
            
            // Enviar estado do jogo para o novo jogador
            socket.emit('gameState', gameManager.getGameState());

            // Notificar outros jogadores
            socket.broadcast.emit('newPlayer', player.toJSON());
            
            Utils.log(`${player.name} entrou no jogo!`, 'GAME');
        } catch (error) {
            Utils.log(`Erro ao adicionar jogador: ${error.message}`, 'ERROR');
            socket.emit('error', { message: 'Erro ao entrar no jogo' });
        }
    });

    // Movimento do jogador
    socket.on('move', (direction) => {
        try {
            const result = gameManager.movePlayer(socket.id, direction);
            
            if (result && result.moved) {
                const player = gameManager.players[socket.id];
                
                // Enviar atualização de movimento
                io.emit('playerMoved', { 
                    id: socket.id, 
                    x: player.x, 
                    y: player.y,
                    score: player.score
                });

                // Se coletou item
                if (result.itemCollected) {
                    // Verificar se mudou a liderança (apenas com 2+ jogadores)
                    const shouldNotifyLeader = gameManager.scoreSystem.shouldNotifyLeadership();
                    const topPlayers = gameManager.scoreSystem.getTopPlayers(1);
                    const newLeader = topPlayers.length > 0 ? topPlayers[0] : null;
                    
                    io.emit('itemCollected', {
                        itemId: result.itemCollected.itemId,
                        playerId: socket.id,
                        playerName: player.name,
                        points: result.itemCollected.points,
                        newScore: result.itemCollected.totalScore,
                        itemType: result.itemCollected.itemType,
                        globalScore: gameManager.scoreSystem.globalScore,
                        newLeader: shouldNotifyLeader ? newLeader : null,
                        isNewLeader: shouldNotifyLeader && newLeader && newLeader.name === player.name
                    });

                    // Enviar conquistas se houver
                    if (result.itemCollected.achievements && result.itemCollected.achievements.length > 0) {
                        socket.emit('achievements', result.itemCollected.achievements);
                    }
                    
                    // Spawnar novo item se necessário
                    const currentItemCount = Object.keys(gameManager.items).length;
                    const GAME_CONFIG = require('./src/config/gameConfig');
                    if (currentItemCount < GAME_CONFIG.MIN_ITEMS) {
                        const newItem = gameManager.spawnItem();
                        if (newItem) {
                            io.emit('newItem', newItem.toJSON());
                        }
                    }
                }
            }
        } catch (error) {
            Utils.log(`Erro no movimento do jogador ${socket.id}: ${error.message}`, 'ERROR');
        }
    });

    // Chat do jogo (opcional)
    socket.on('chatMessage', (data) => {
        try {
            const player = gameManager.players[socket.id];
            if (player && data.message) {
                const sanitizedMessage = Utils.sanitizeString(data.message).substring(0, 100);
                io.emit('chatMessage', {
                    playerId: socket.id,
                    playerName: player.name,
                    message: sanitizedMessage,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            Utils.log(`Erro na mensagem de chat: ${error.message}`, 'ERROR');
        }
    });

    // Desconexão
    socket.on('disconnect', () => {
        try {
            const playerName = gameManager.removePlayer(socket.id);
            if (playerName) {
                Utils.log(`${playerName} saiu do jogo`, 'GAME');
                io.emit('playerDisconnected', {
                    id: socket.id,
                    name: playerName,
                    globalScore: gameManager.scoreSystem.globalScore
                });
            }
        } catch (error) {
            Utils.log(`Erro na desconexão: ${error.message}`, 'ERROR');
        }
    });

    // Ping/Pong para monitorar conexão
    socket.on('ping', () => {
        socket.emit('pong');
    });
});

// Limpeza periódica de items expirados
setInterval(() => {
    const cleanupResult = gameManager.cleanupExpiredItems();
    if (cleanupResult.expired > 0) {
        Utils.log(`Limpeza: ${cleanupResult.expired} items expirados removidos, ${cleanupResult.spawned} novos items criados. Total: ${cleanupResult.currentTotal}`, 'CLEANUP');
        
        // Enviar novos items se foram criados (sem notificação)
        if (cleanupResult.spawned > 0) {
            const gameState = gameManager.getGameState();
            io.emit('gameStateUpdate', {
                items: gameState.items
            });
        }
    }
}, 10000); // A cada 10 segundos

// Estatísticas periódicas
setInterval(() => {
    const playerCount = Object.keys(gameManager.players).length;
    const itemCount = Object.keys(gameManager.items).length;
    Utils.log(`Status: ${playerCount} jogadores, ${itemCount} items`, 'STATS');
}, 60000); // A cada minuto

// Tratamento de erros
process.on('uncaughtException', (error) => {
    Utils.log(`Erro não capturado: ${error.message}`, 'FATAL');
    console.error(error);
});

process.on('unhandledRejection', (reason, promise) => {
    Utils.log(`Promise rejeitada: ${reason}`, 'ERROR');
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    Utils.log(`Servidor rodando em http://localhost:${PORT}`, 'SERVER');
});