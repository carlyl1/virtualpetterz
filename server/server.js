const express = require('express');
const http = require('http');
const path = require('path')
const cors = require('cors');
const fs = require('fs')
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Check if socket.io is available
let io = null;
try {
  const socketIo = require('socket.io');
  io = socketIo(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });
} catch (e) {
  console.log('⚠️ Socket.IO not available - running in HTTP-only mode');
}

// Configure CORS for Express
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));

const PORT = process.env.PORT || 8787
const HF_MODEL_URL = process.env.HF_MODEL_URL || ''
const HF_API_KEY = process.env.HF_API_KEY || ''
const START_AT = Date.now()

app.use(express.json({ limit: '1mb' }))

// In-memory game state
const gameState = {
  players: new Map(),
  battleQueue: [],
  activeBattles: new Map(),
  leaderboard: [],
  adventures: new Map()
};

// Battle system
class BattleSystem {
  constructor() {
    this.battles = new Map();
  }

  createBattle(player1, player2) {
    const battleId = uuidv4();
    const battle = {
      id: battleId,
      player1: { ...player1, currentHp: player1.stats?.hp || 100 },
      player2: { ...player2, currentHp: player2.stats?.hp || 100 },
      turn: 1,
      currentPlayer: Math.random() < 0.5 ? 'player1' : 'player2',
      status: 'active',
      history: [],
      startTime: Date.now()
    };
    
    this.battles.set(battleId, battle);
    gameState.activeBattles.set(battleId, battle);
    
    return battle;
  }

  performAction(battleId, playerId, action) {
    const battle = this.battles.get(battleId);
    if (!battle || battle.status !== 'active') return null;

    const isPlayer1 = battle.player1.id === playerId;
    const attacker = isPlayer1 ? battle.player1 : battle.player2;
    const defender = isPlayer1 ? battle.player2 : battle.player1;

    let damage = 0;
    let result = { type: action, success: false };

    switch(action) {
      case 'attack':
        const attackPower = (attacker.stats?.attack || 15) + Math.floor(Math.random() * 10);
        const defense = defender.stats?.defense || 10;
        damage = Math.max(1, attackPower - defense + Math.floor(Math.random() * 5));
        defender.currentHp = Math.max(0, defender.currentHp - damage);
        result = { type: 'attack', success: true, damage, critical: damage > attackPower };
        break;
        
      case 'defend':
        attacker.defending = true;
        result = { type: 'defend', success: true, defenseBoost: Math.floor((attacker.stats?.defense || 10) * 0.5) };
        break;
        
      case 'special':
        const specialDamage = Math.floor((attacker.stats?.attack || 15) * 1.5) + Math.floor(Math.random() * 8);
        defender.currentHp = Math.max(0, defender.currentHp - specialDamage);
        result = { type: 'special', success: true, damage: specialDamage };
        break;
    }

    battle.history.push({
      turn: battle.turn,
      player: isPlayer1 ? 'player1' : 'player2',
      action: result
    });

    // Check for battle end
    if (defender.currentHp <= 0) {
      battle.status = 'completed';
      battle.winner = isPlayer1 ? 'player1' : 'player2';
      battle.endTime = Date.now();
      
      this.updateLeaderboard(battle);
    } else {
      battle.currentPlayer = battle.currentPlayer === 'player1' ? 'player2' : 'player1';
      battle.turn++;
    }

    return { battle, actionResult: result };
  }

  updateLeaderboard(battle) {
    const winner = battle.winner === 'player1' ? battle.player1 : battle.player2;
    const loser = battle.winner === 'player1' ? battle.player2 : battle.player1;
    
    let winnerEntry = gameState.leaderboard.find(p => p.id === winner.id);
    let loserEntry = gameState.leaderboard.find(p => p.id === loser.id);
    
    if (!winnerEntry) {
      winnerEntry = { id: winner.id, name: winner.name || 'Unknown', wins: 0, losses: 0, rating: 1000 };
      gameState.leaderboard.push(winnerEntry);
    }
    
    if (!loserEntry) {
      loserEntry = { id: loser.id, name: loser.name || 'Unknown', wins: 0, losses: 0, rating: 1000 };
      gameState.leaderboard.push(loserEntry);
    }
    
    winnerEntry.wins++;
    loserEntry.losses++;
    
    const expectedWin = 1 / (1 + Math.pow(10, (loserEntry.rating - winnerEntry.rating) / 400));
    const ratingChange = Math.floor(32 * (1 - expectedWin));
    
    winnerEntry.rating += ratingChange;
    loserEntry.rating -= ratingChange;
    
    gameState.leaderboard.sort((a, b) => b.rating - a.rating);
  }
}

const battleSystem = new BattleSystem();

// Socket.IO multiplayer logic (if available)
if (io) {
  io.on('connection', (socket) => {
    console.log('🔗 Player connected:', socket.id);

    socket.on('register_player', (playerData) => {
      const player = {
        id: socket.id,
        socketId: socket.id,
        ...playerData,
        connectedAt: Date.now(),
        status: 'online'
      };
      
      gameState.players.set(socket.id, player);
      console.log('👤 Player registered:', player.name || socket.id);
      
      socket.emit('player_registered', {
        playerId: socket.id,
        gameState: {
          playersOnline: gameState.players.size,
          leaderboard: gameState.leaderboard.slice(0, 10)
        }
      });
    });

    socket.on('join_battle_queue', (playerData) => {
      const player = gameState.players.get(socket.id) || { ...playerData, id: socket.id };
      
      if (gameState.battleQueue.length > 0) {
        const opponent = gameState.battleQueue.shift();
        const battle = battleSystem.createBattle(player, opponent.player);
        
        socket.emit('battle_found', {
          battleId: battle.id,
          opponent: battle.player2,
          yourTurn: battle.currentPlayer === 'player1'
        });
        
        io.to(opponent.socketId).emit('battle_found', {
          battleId: battle.id,
          opponent: battle.player1,
          yourTurn: battle.currentPlayer === 'player2'
        });
        
        console.log(`⚔️ Battle started: ${player.name} vs ${opponent.player.name}`);
      } else {
        gameState.battleQueue.push({ player, socketId: socket.id });
        socket.emit('battle_queue_joined', { position: gameState.battleQueue.length });
      }
    });

    socket.on('battle_action', ({ battleId, action }) => {
      const result = battleSystem.performAction(battleId, socket.id, action);
      if (result) {
        const { battle, actionResult } = result;
        
        const battleUpdate = {
          battle: {
            ...battle,
            player1: { ...battle.player1, id: undefined },
            player2: { ...battle.player2, id: undefined }
          },
          lastAction: actionResult
        };
        
        io.to(battle.player1.id).emit('battle_update', battleUpdate);
        io.to(battle.player2.id).emit('battle_update', battleUpdate);
        
        if (battle.status === 'completed') {
          const winnerReward = { tokens: 25, exp: 50 };
          const loserReward = { tokens: 5, exp: 15 };
          
          io.to(battle.winner === 'player1' ? battle.player1.id : battle.player2.id).emit('battle_result', {
            victory: true,
            ...winnerReward,
            battle
          });
          
          io.to(battle.winner === 'player1' ? battle.player2.id : battle.player1.id).emit('battle_result', {
            victory: false,
            ...loserReward,
            battle
          });
          
          battleSystem.battles.delete(battleId);
          gameState.activeBattles.delete(battleId);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Player disconnected:', socket.id);
      const queueIndex = gameState.battleQueue.findIndex(q => q.socketId === socket.id);
      if (queueIndex !== -1) {
        gameState.battleQueue.splice(queueIndex, 1);
      }
      gameState.players.delete(socket.id);
    });
  });
}

const chatLimiter = require('express-rate-limit')({ windowMs: 15 * 60 * 1000, max: 300 })

// Multiplayer API endpoints
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    players: gameState.players.size,
    battles: gameState.activeBattles.size,
    adventures: gameState.adventures.size,
    uptime: process.uptime(),
    hasSocketIO: !!io
  });
});

app.get('/api/leaderboard', (req, res) => {
  res.json(gameState.leaderboard.slice(0, 50));
});

app.post('/api/battle/simulate', (req, res) => {
  try {
    const { player1, player2 } = req.body;
    if (!player1 || !player2) {
      return res.status(400).json({ error: 'Missing player data' });
    }
    
    // Simulate a quick battle for non-websocket clients
    const battle = battleSystem.createBattle(
      { id: 'player1', name: player1.name || 'Player 1', stats: player1.stats },
      { id: 'player2', name: player2.name || 'Player 2', stats: player2.stats }
    );
    
    // Simulate battle rounds
    while (battle.status === 'active' && battle.turn < 20) {
      const actions = ['attack', 'attack', 'attack', 'defend', 'special'];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const currentPlayerId = battle.currentPlayer === 'player1' ? 'player1' : 'player2';
      
      battleSystem.performAction(battle.id, currentPlayerId, randomAction);
    }
    
    // Clean up
    battleSystem.battles.delete(battle.id);
    gameState.activeBattles.delete(battle.id);
    
    const victory = battle.winner === 'player1';
    res.json({
      victory,
      battle: {
        ...battle,
        player1: { ...battle.player1, id: undefined },
        player2: { ...battle.player2, id: undefined }
      },
      tokens: victory ? 15 : 5,
      exp: victory ? 25 : 10
    });
  } catch (error) {
    console.error('Battle simulation error:', error);
    res.status(500).json({ error: 'Battle simulation failed' });
  }
});

// Battle result validation endpoint
app.post('/api/battle/validate', (req, res) => {
  try {
    const { battleData, playerStats, opponentStats, result } = req.body;
    
    if (!battleData || !playerStats || !opponentStats || !result) {
      return res.status(400).json({ error: 'Missing battle validation data' });
    }
    
    // Server-side validation of battle results
    const isValid = validateBattleResult(battleData, playerStats, opponentStats, result);
    
    if (isValid.valid) {
      // Update server leaderboard if battle result is valid
      updateLeaderboard(result.playerId, result.opponentId, result.victory);
      
      res.json({
        valid: true,
        verified: true,
        rewards: {
          tokens: result.victory ? Math.floor(15 + Math.random() * 10) : 5,
          exp: result.victory ? Math.floor(25 + Math.random() * 15) : 10,
          rating_change: isValid.ratingChange || 0
        }
      });
    } else {
      res.json({
        valid: false,
        reason: isValid.reason,
        verified: false
      });
    }
  } catch (error) {
    console.error('Battle validation error:', error);
    res.status(500).json({ error: 'Battle validation failed' });
  }
});

function validateBattleResult(battleData, playerStats, opponentStats, result) {
  // Basic sanity checks
  if (result.playerFinalHp < 0 || result.opponentFinalHp < 0) {
    return { valid: false, reason: 'Invalid final HP values' };
  }
  
  if (result.playerFinalHp > playerStats.maxHp || result.opponentFinalHp > opponentStats.maxHp) {
    return { valid: false, reason: 'Final HP exceeds maximum' };
  }
  
  // Validate victory condition
  if (result.victory && result.opponentFinalHp > 0) {
    return { valid: false, reason: 'Victory claimed but opponent still has HP' };
  }
  
  if (!result.victory && result.playerFinalHp > 0) {
    return { valid: false, reason: 'Defeat claimed but player still has HP' };
  }
  
  // Calculate expected rating change
  const playerRating = playerStats.rating || 1000;
  const opponentRating = opponentStats.rating || 1000;
  const expectedWin = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  const ratingChange = Math.floor(32 * (result.victory ? (1 - expectedWin) : (0 - expectedWin)));
  
  return { 
    valid: true, 
    ratingChange: result.victory ? Math.abs(ratingChange) : -Math.abs(ratingChange)
  };
}

function updateLeaderboard(playerId, opponentId, victory) {
  // Find or create player entries
  let playerEntry = gameState.leaderboard.find(p => p.id === playerId);
  if (!playerEntry) {
    playerEntry = { id: playerId, name: 'Player', wins: 0, losses: 0, rating: 1000 };
    gameState.leaderboard.push(playerEntry);
  }
  
  // Update win/loss records
  if (victory) {
    playerEntry.wins++;
  } else {
    playerEntry.losses++;
  }
  
  // Re-sort leaderboard
  gameState.leaderboard.sort((a, b) => {
    const aWinRate = (a.wins + a.losses) > 0 ? a.wins / (a.wins + a.losses) : 0;
    const bWinRate = (b.wins + b.losses) > 0 ? b.wins / (b.wins + b.losses) : 0;
    return bWinRate - aWinRate;
  });
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
  ])
}

async function callHuggingFace(prompt) {
  if (!HF_MODEL_URL || !HF_API_KEY) return null
  const req = fetch(HF_MODEL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 80, temperature: 0.8, return_full_text: false } }),
  })
  const res = await withTimeout(req, 15000)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HF error ${res.status}: ${text}`)
  }
  const data = await res.json()
  const out = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text || data?.[0]?.generated_text
  return out || ''
}

app.get('/health', (_req, res) => {
  const mem = process.memoryUsage()
  res.json({ status: 'ok', uptime: process.uptime(), startedAt: new Date(START_AT).toISOString(), version: process.env.VERSION || '1.0.0', memory: { rss: mem.rss, heapUsed: mem.heapUsed } })
})

app.get('/ready', (_req, res) => {
  const distIndex = path.resolve(__dirname, '..', 'dist', 'index.html')
  const hasDist = fs.existsSync(distIndex)
  res.json({ ready: hasDist })
})

app.post('/chat', chatLimiter, async (req, res) => {
  try {
    const input = (req.body?.input || '').toString()
    
    // Enhanced input validation
    if (!input || typeof input !== 'string') {
      return res.status(400).json({ error: 'missing input' })
    }
    
    if (input.length > 500) {
      return res.status(400).json({ error: 'input too long' })
    }
    
    if (input.trim().length === 0) {
      return res.status(400).json({ error: 'empty input' })
    }
    
    // Basic sanitization
    const sanitizedInput = input.replace(/[<>]/g, '').trim()
    if (sanitizedInput !== input.trim()) {
      return res.status(400).json({ error: 'invalid characters in input' })
    }
    
    const hf = await callHuggingFace(sanitizedInput).catch(() => null)
    if (hf != null) return res.json({ output: hf })
    return res.json({ output: "I'm your pixel pet! Tell me if you want to feed or play." })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'chat failed' })
  }
})

// Serve the built frontend from ../dist
const distDir = path.resolve(__dirname, '..', 'dist')
app.use(express.static(distDir, { maxAge: '1d', immutable: true }))
app.get('*', (_req, res) => {
  res.set('Cache-Control', 'no-cache')
  res.sendFile(path.join(distDir, 'index.html'))
})

server.listen(PORT, () => { 
  console.log(`🚀 Crypto Tama server listening on http://localhost:${PORT}`) 
  console.log(`🎮 WebSocket${io ? '' : ' (disabled)'}: ws://localhost:${PORT}`)
  console.log(`📊 Game Status: ${gameState.players.size} players, ${gameState.activeBattles.size} battles`)
})