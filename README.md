# 🎮 Jogo Multiplayer - TA Atividade 02

## 📝 Descrição
Jogo multiplayer em tempo real onde jogadores se movem pelo mapa, coletam itens geométricos e competem por pontuação. Desenvolvido com Node.js, Socket.IO e HTML5 Canvas.

## ✅ Requisitos Obrigatórios - 100% Implementados

### 1. **Colisões básicas (ambiente e jogadores)** ✅
- **1a.** Sistema robusto de detecção de colisões com paredes em `CollisionSystem.js`
- **1b.** Prevenção total de sobreposição entre jogadores com função `checkPlayerCollision()`
- **Implementação**: Mapa navegável com barreiras estratégicas e espaços adequados

### 2. **Identificação e Personalização** ✅
- **2a.** Interface completa para nome personalizado (máx. 15 caracteres)
- **2b.** Seletor de cor único para cada jogador
- **Implementação**: Modal de setup com validação antes de entrar no jogo

### 3. **Sincronização mais eficiente** ✅
- **3a.** Sistema de delta updates - envia apenas dados que mudaram
- **3b.** Otimização de rede com eventos específicos
- **Implementação**: WebSockets otimizados com Socket.IO

### 4. **Desconexão de jogadores** ✅
- **4a.** Detecção automática quando jogador sai
- **4b.** Notificação visual: "Jogador saiu do jogo"
- **4c.** Remoção imediata do placar e atualização para todos
- **Implementação**: Limpeza completa do estado do jogo

### 5. **Sistema de Pontuação** ✅
- **5a.** Items aparecem aleatoriamente no mapa (5-12 simultâneos)
- **5b.** Três tipos com valores crescentes:
  - 🟨 **Círculos Dourados**: 10 pontos (60% spawn)
  - 🟥 **Losangos Vermelhos**: 25 pontos (30% spawn)
  - 🟣 **Estrelas Roxas**: 50 pontos (10% spawn)
- **5c.** Placar global compartilhado em tempo real
- **5d.** Items expiram automaticamente após 30 segundos

## 🚀 Como Executar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Iniciar servidor:**
   ```bash
   npm start
   ```

3. **Acessar o jogo:**
   ```
   http://localhost:3000
   ```

## 🎮 Como Jogar

- **Movimento**: Use as setas direcionais ←↑↓→
- **Objetivo**: Colete o máximo de itens para ganhar pontos
- **Estratégia**: Estrelas valem mais, mas são mais raras
- **Competição**: Dispute a liderança com até 10 jogadores simultaneamente
- **Liderança**: Sistema especial destaca quem está na frente

## 🏗️ Arquitetura Modular

### Backend Organizado (Node.js + Socket.IO)
```
src/
├── config/gameConfig.js     # Configurações centralizadas
├── game/
│   ├── GameManager.js       # Coordenador principal
│   ├── Player.js           # Gerenciamento de jogadores
│   ├── Item.js             # Sistema de itens
│   ├── CollisionSystem.js  # Detecção de colisões
│   └── ScoreSystem.js      # Pontuação e liderança
└── utils/utils.js          # Funções utilitárias
```

### Frontend Otimizado (HTML5 Canvas)
```
public/
├── index.html              # Interface principal
├── css/styles.css         # Estilos responsivos
└── js/gameClient.js       # Cliente orientado a objetos
```

## 🔧 Tecnologias
- **Backend**: Node.js, Express.js, Socket.IO
- **Frontend**: HTML5 Canvas, CSS3, JavaScript ES6+
- **Comunicação**: WebSockets em tempo real
- **Arquitetura**: Orientada a objetos e modular

## 📊 Funcionalidades Extras Implementadas
- 🏆 **Sistema de conquistas** (primeira coleta, colecionador, centurião)
- 👑 **Rastreamento de liderança** com notificações especiais
- 🧹 **Limpeza automática** de itens expirados sem poluir interface
- 📈 **API de estatísticas** em `/api/stats`
- 🎨 **Interface responsiva** com animações CSS
- 🛡️ **Validação robusta** e sanitização de dados
- 📱 **Design mobile-friendly**

## 🎯 Sistema de Liderança Inteligente
- **Notificação condicional**: Só notifica sobre líder quando há **2 ou mais jogadores**
- **Detecção automática** de mudança de líder
- **Notificação especial**: "🏆 [Nome] é o novo líder com X pontos!" (apenas com competição real)
- **Atualização em tempo real** quando líder sai do jogo
- **Destaque visual** no placar para o líder atual
- **Lógica inteligente**: Evita spam de notificações desnecessárias quando jogando sozinho

## 🐛 Correções de Bugs Aplicadas
- ✅ **Coleta de itens**: Corrigido bug após desconexão de jogadores
- ✅ **Placar**: Remoção imediata de jogadores desconectados
- ✅ **Sincronização**: Estado consistente entre todos os clientes
- ✅ **Performance**: Otimização de rede e renderização

## 📁 Estrutura Final do Projeto
```
TA_atividade_02/
├── src/                 # Código fonte modular do servidor
│   ├── config/         # Configurações centralizadas
│   ├── game/           # Classes principais (5 arquivos)
│   └── utils/          # Funções utilitárias
├── public/             # Arquivos do cliente
│   ├── css/           # Estilos organizados
│   ├── js/            # Cliente orientado a objetos
│   └── index.html     # Interface limpa
├── server.js          # Servidor principal otimizado
├── package.json       # Dependências atualizadas
└── README.md          # Documentação completa
```

## � Status Final

### ✅ **Todos os 5 Requisitos Obrigatórios Implementados**
### ✅ **Projeto Organizado e Modular**
### ✅ **Sistema Robusto e Otimizado**
### ✅ **Interface Profissional**
### ✅ **Documentação Completa**

**🎮 Teste o jogo em: http://localhost:3000**

---
**Desenvolvido para a disciplina de Tópicos Avançados - Projeto Completo e Funcional**