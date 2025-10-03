# Jogo Multiplayer - TA Atividade 02

## Descrição
Jogo multiplayer em tempo real desenvolvido com Node.js, Socket.IO e HTML5 Canvas. Os jogadores podem se mover pelo mapa, coletam itens e competem por pontuação.

## Funcionalidades Implementadas

### ✅ Requisitos Obrigatórios
1. **Colisões básicas (ambiente e jogadores)**
   - Implementação de barreiras (paredes) que impedem movimento
   - Sistema de colisão robusto para evitar sobreposição

2. **Identificação e Personalização**
   - Atribuição de nomes aos jogadores
   - Escolha de cor/skin personalizada ao conectar

3. **Sincronização mais eficiente**
   - Delta updates (envio apenas do que mudou)
   - Otimização de rede para melhor performance

4. **Desconexão de jogadores**
   - Detecção automática de desconexão
   - Notificação visual para outros jogadores

5. **Sistema de Pontuação**
   - Items aparecem aleatoriamente no ambiente
   - Diferentes tipos de items com valores distintos
   - Placar global compartilhado no servidor

## Estrutura do Projeto

```
TA_atividade_02/
├── src/
│   ├── config/
│   │   └── gameConfig.js      # Configurações centralizadas
│   ├── game/
│   │   ├── GameManager.js     # Gerenciador principal do jogo
│   │   ├── Player.js          # Classe de jogador
│   │   ├── Item.js            # Classe de items
│   │   ├── CollisionSystem.js # Sistema de colisões
│   │   └── ScoreSystem.js     # Sistema de pontuação
│   └── utils/
│       └── utils.js           # Funções utilitárias
├── public/
│   ├── css/
│   │   └── styles.css         # Estilos do jogo
│   ├── js/
│   │   └── gameClient.js      # Cliente principal
│   └── index.html             # Interface principal
├── server.js                  # Servidor principal
└── package.json               # Dependências do projeto
```

## Tecnologias Utilizadas
- **Backend**: Node.js, Express.js, Socket.IO
- **Frontend**: HTML5 Canvas, CSS3, JavaScript ES6+
- **Comunicação**: WebSockets em tempo real

## Como Executar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Iniciar o servidor:**
   ```bash
   npm start
   ```

3. **Acessar o jogo:**
   Abra o navegador em `http://localhost:3000`

## Mecânicas do Jogo

### Controles
- **Setas direcionais**: Movimento do jogador
- **Enter**: Confirmar entrada no jogo

### Sistema de Pontuação
- **Moedas douradas**: 10 pontos
- **Gemas vermelhas**: 25 pontos
- **Placar**: Ranking dos top 5 jogadores

### Conquistas
- **Primeira coleta**: Primeiro item coletado
- **Colecionador**: 10 items coletados
- **Centurião**: 100 pontos alcançados

## Recursos Avançados

### Performance
- Delta updates para sincronização eficiente
- Throttling de eventos para otimização
- Limpeza automática de items expirados

### Interface
- Animações CSS suaves
- Notificações visuais para eventos
- Design responsivo

### Escalabilidade
- Código modular e organizando
- Sistema de configuração centralizada
- Tratamento robusto de erros

## API Endpoints

### `/api/stats`
Retorna estatísticas do servidor:
```json
{
  "playersOnline": 5,
  "itemsAvailable": 12,
  "topPlayers": [...],
  "serverUptime": 3600
}
```

## Arquitetura

### Server-Side
- **GameManager**: Coordena toda a lógica do jogo
- **Player**: Gerencia dados e ações dos jogadores
- **CollisionSystem**: Detecta colisões entre objetos
- **ScoreSystem**: Gerencia pontuação e conquistas

### Client-Side
- **GameClient**: Classe principal do cliente
- **Renderização**: Canvas 2D com otimizações
- **Network**: Comunicação via Socket.IO

## Configurações

Todas as configurações do jogo estão centralizadas em `src/config/gameConfig.js`:

```javascript
const GAME_CONFIG = {
    CANVAS_WIDTH: 600,
    CANVAS_HEIGHT: 400,
    PLAYER_SIZE: 30,
    ITEM_SPAWN_INTERVAL: 3000,
    // ... outras configurações
};
```

## Próximas Melhorias

- [ ] Sistema de chat em tempo real
- [ ] Diferentes tipos de jogadores (classes)
- [ ] Power-ups temporários
- [ ] Mapas alternativos
- [ ] Persistência de dados
- [ ] Modo espectador

## Autor
Projeto desenvolvido para a disciplina de Tópicos Avançados.

## Licença
MIT License