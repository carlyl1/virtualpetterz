import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import progressionSystem from '../systems/PersistentProgression';
import leaderboardSystem from '../systems/LeaderboardSystem';
import multiplayerService from '../services/MultiplayerService';

const MOCK_PLAYERS = [
  { id: 'mock1', name: 'CryptoKnight', petSpecies: 'shadow_wolf', level: 15, rating: 1250 },
  { id: 'mock2', name: 'PixelMaster', petSpecies: 'robo_cat', level: 12, rating: 1180 },
  { id: 'mock3', name: 'MemeQueen', petSpecies: 'glitch_moth', level: 18, rating: 1340 },
  { id: 'mock4', name: 'NFTWarrior', petSpecies: 'mystic_bunny', level: 14, rating: 1200 },
  { id: 'mock5', name: 'BlockchainBoss', petSpecies: 'chonk_hamster', level: 16, rating: 1280 }
];

const BATTLE_STATES = {
  SEARCHING: 'searching',
  MATCHED: 'matched', 
  IN_BATTLE: 'in_battle',
  COMPLETED: 'completed'
};

// Server-side battle validation function
async function validateBattleWithServer(battleValidationData) {
  try {
    const response = await fetch('http://localhost:8787/api/battle/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        battleData: {},
        playerStats: battleValidationData.playerStats,
        opponentStats: battleValidationData.opponentStats,
        result: battleValidationData.result
      })
    });

    if (!response.ok) {
      throw new Error(`Validation failed: ${response.status}`);
    }

    const validation = await response.json();
    console.log('🔍 Battle validation result:', validation);
    
    return validation;
  } catch (error) {
    console.warn('⚠️ Server validation failed:', error);
    // Return offline validation result
    return {
      valid: true,
      verified: false,
      rewards: {
        tokens: battleValidationData.result.victory ? 10 : 3,
        exp: battleValidationData.result.victory ? 15 : 5,
        rating_change: 0
      }
    };
  }
}

export default function P2PBattleRoom({ 
  playerPet, 
  onBattleStart, 
  onBattleComplete, 
  onExit 
}) {
  const { publicKey } = useWallet();
  const [battleState, setBattleState] = useState(BATTLE_STATES.SEARCHING);
  const [matchedPlayer, setMatchedPlayer] = useState(null);
  const [searchTime, setSearchTime] = useState(0);
  const [waitingPlayers] = useState([]); // Real players would be here
  const [battleResult, setBattleResult] = useState(null);
  const [playerStats, setPlayerStats] = useState({
    hp: playerPet?.stats?.hp || 100,
    energy: 100,
    attack: playerPet?.stats?.attack || 15,
    defense: playerPet?.stats?.defense || 8,
    speed: playerPet?.stats?.speed || 12
  });
  const [opponentStats, setOpponentStats] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [currentTurn, setCurrentTurn] = useState('player');
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  
  const searchTimerRef = useRef();
  const matchTimeoutRef = useRef();

  // Start real multiplayer matchmaking
  useEffect(() => {
    if (battleState === BATTLE_STATES.SEARCHING) {
      searchTimerRef.current = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);

      // Register with multiplayer service
      const playerData = {
        id: publicKey?.toString() || `guest-${Date.now()}`,
        name: playerPet?.name || 'Your Pet',
        petSpecies: playerPet?.species || 'forest-fox',
        level: playerPet?.level || 1,
        rating: playerPet?.rating || 1000,
        stats: playerStats
      };

      // Try to join real multiplayer queue
      const joinedQueue = multiplayerService.joinBattleQueue(playerData);
      
      if (joinedQueue) {
        console.log('🎯 Joined real multiplayer battle queue');
        
        // Listen for battle found
        const handleBattleFound = (data) => {
          console.log('⚔️ Real battle found!', data);
          setMatchedPlayer({
            ...data.opponent,
            isMock: false
          });
          setOpponentStats(data.opponent.stats);
          setBattleState(BATTLE_STATES.MATCHED);
          clearInterval(searchTimerRef.current);
        };
        
        multiplayerService.on('battle_found', handleBattleFound);
        
        // Fallback to mock after reasonable wait (30 seconds)
        matchTimeoutRef.current = setTimeout(() => {
          console.log('🤖 No real players found, using AI opponent');
          multiplayerService.off('battle_found', handleBattleFound);
          
          const mockOpponent = MOCK_PLAYERS[Math.floor(Math.random() * MOCK_PLAYERS.length)];
          const enhancedOpponent = {
            ...mockOpponent,
            stats: {
              hp: 80 + Math.floor(Math.random() * 40),
              attack: 10 + Math.floor(Math.random() * 15),
              defense: 5 + Math.floor(Math.random() * 10),
              speed: 8 + Math.floor(Math.random() * 12),
              energy: 100
            },
            isMock: true
          };
          setMatchedPlayer(enhancedOpponent);
          setOpponentStats(enhancedOpponent.stats);
          setBattleState(BATTLE_STATES.MATCHED);
          clearInterval(searchTimerRef.current);
        }, 30000);
        
        return () => {
          multiplayerService.off('battle_found', handleBattleFound);
        };
      } else {
        // No multiplayer connection, wait longer before using AI opponent
        console.log('🤖 No multiplayer connection, searching for 15 seconds before using AI opponent');
        matchTimeoutRef.current = setTimeout(() => {
          console.log('⏱️ Search timeout reached, using AI opponent');
          const mockOpponent = MOCK_PLAYERS[Math.floor(Math.random() * MOCK_PLAYERS.length)];
          const enhancedOpponent = {
            ...mockOpponent,
            stats: {
              hp: 80 + Math.floor(Math.random() * 40),
              attack: 10 + Math.floor(Math.random() * 15),
              defense: 5 + Math.floor(Math.random() * 10),
              speed: 8 + Math.floor(Math.random() * 12),
              energy: 100
            },
            isMock: true
          };
          setMatchedPlayer(enhancedOpponent);
          setOpponentStats(enhancedOpponent.stats);
          setBattleState(BATTLE_STATES.MATCHED);
          clearInterval(searchTimerRef.current);
        }, 15000); // 15 second wait even without multiplayer
      }
    }

    return () => {
      if (searchTimerRef.current) clearInterval(searchTimerRef.current);
      if (matchTimeoutRef.current) clearTimeout(matchTimeoutRef.current);
    };
  }, [battleState]);

  // Auto-start battle after match found
  useEffect(() => {
    if (battleState === BATTLE_STATES.MATCHED && matchedPlayer) {
      setTimeout(() => {
        setBattleState(BATTLE_STATES.IN_BATTLE);
        setBattleLog([`Battle started between ${playerPet?.name || 'Your Pet'} and ${matchedPlayer.name}!`]);
        onBattleStart?.(matchedPlayer);
      }, 2000);
    }
  }, [battleState, matchedPlayer]);

  // Calculate battle action success
  const calculateActionSuccess = (attacker, defender, actionType) => {
    const random = Math.random();
    let successChance = 0.7; // Base success rate
    
    switch (actionType) {
      case 'attack':
        successChance = Math.min(0.9, 0.6 + (attacker.speed - defender.speed) * 0.02);
        break;
      case 'defend':
        successChance = Math.min(0.95, 0.8 + (defender.defense - attacker.attack) * 0.01);
        break;
      case 'evade':
        successChance = Math.min(0.8, 0.5 + (defender.speed - attacker.speed) * 0.03);
        break;
      default:
        successChance = 0.7;
    }
    
    return random < successChance;
  };

  // Calculate damage
  const calculateDamage = (attacker, defender, actionType, isSuccessful) => {
    if (!isSuccessful) return 0;
    
    const baseDamage = attacker.attack;
    const defense = defender.defense;
    const random = 0.8 + Math.random() * 0.4; // 0.8 to 1.2 multiplier
    
    let damage = Math.max(1, Math.floor((baseDamage - defense * 0.5) * random));
    
    // Critical hits
    if (Math.random() < 0.15) {
      damage = Math.floor(damage * 1.5);
    }
    
    return Math.min(damage, defender.hp);
  };

  // Player battle actions
  const performBattleAction = (actionType) => {
    if (!isPlayerTurn || battleState !== BATTLE_STATES.IN_BATTLE) return;
    
    const isSuccessful = calculateActionSuccess(playerStats, opponentStats, actionType);
    let damage = 0;
    let logMessage = '';
    let newPlayerStats = { ...playerStats };
    let newOpponentStats = { ...opponentStats };
    
    // Consume energy
    newPlayerStats.energy = Math.max(0, newPlayerStats.energy - 15);
    
    switch (actionType) {
      case 'attack':
        damage = calculateDamage(playerStats, opponentStats, 'attack', isSuccessful);
        if (isSuccessful) {
          newOpponentStats.hp = Math.max(0, newOpponentStats.hp - damage);
          logMessage = `${playerPet?.name || 'Your Pet'} attacks for ${damage} damage!`;
        } else {
          logMessage = `${playerPet?.name || 'Your Pet'}'s attack missed!`;
        }
        break;
        
      case 'defend':
        if (isSuccessful) {
          newPlayerStats.defense += 3; // Temporary defense boost
          logMessage = `${playerPet?.name || 'Your Pet'} raises defense!`;
        } else {
          logMessage = `${playerPet?.name || 'Your Pet'} failed to defend properly!`;
        }
        break;
        
      case 'evade':
        if (isSuccessful) {
          newPlayerStats.speed += 2; // Temporary speed boost
          logMessage = `${playerPet?.name || 'Your Pet'} increases agility!`;
        } else {
          logMessage = `${playerPet?.name || 'Your Pet'} stumbles while trying to evade!`;
        }
        break;
        
      default:
        logMessage = `${playerPet?.name || 'Your Pet'} does nothing...`;
    }
    
    setPlayerStats(newPlayerStats);
    setOpponentStats(newOpponentStats);
    setBattleLog(prev => [...prev, logMessage]);
    
    // Check if opponent is defeated
    if (newOpponentStats.hp <= 0) {
      setBattleLog(prev => [...prev, `${matchedPlayer.name} is defeated! You win!`]);
      // Validate battle results with server
      validateBattleWithServer({
        playerStats: { ...playerPet?.stats, maxHp: playerPet?.stats?.hp || 100 },
        opponentStats: { ...matchedPlayer.stats, maxHp: matchedPlayer.stats.hp },
        result: {
          victory: true,
          playerId: publicKey?.toString() || 'guest',
          opponentId: matchedPlayer.id,
          playerFinalHp: newPlayerStats.hp,
          opponentFinalHp: newOpponentStats.hp,
          turnsPlayed: battleLog.length
        }
      }).then(validation => {
        const rewards = validation.verified ? validation.rewards : { tokens: 5, exp: 10 };
        setBattleResult({ 
          winner: 'player', 
          experience: rewards.exp, 
          tokens: rewards.tokens,
          verified: validation.verified,
          ratingChange: rewards.rating_change
        });
        setBattleState(BATTLE_STATES.COMPLETED);
        
        // Record battle in progression system
        if (publicKey) {
          progressionSystem.recordBattle(
            publicKey.toString(),
            matchedPlayer.id,
            { winner: 'player', experience: rewards.exp, tokens: rewards.tokens },
            {
              playerStartHp: playerPet?.stats?.hp || 100,
              playerEndHp: newPlayerStats.hp,
              turnsPlayed: battleLog.length,
              rewards: rewards,
              verified: validation.verified
            }
          );
          
          // Record in leaderboard system
          leaderboardSystem.recordBattle(
            publicKey.toString(),
            matchedPlayer.id,
            { winner: 'player', experience: rewards.exp, tokens: rewards.tokens },
            {
              playerName: playerPet?.name || 'Your Pet',
              opponentName: matchedPlayer.name,
              playerStartHp: playerPet?.stats?.hp || 100,
              playerEndHp: newPlayerStats.hp,
              turnsPlayed: battleLog.length,
              verified: validation.verified
            }
          );
        }
      }).catch(error => {
        console.warn('Battle validation failed, using offline rewards:', error);
        setBattleResult({ winner: 'player', experience: 15, tokens: 5, verified: false });
        setBattleState(BATTLE_STATES.COMPLETED);
      });
      
      return;
    }
    
    // Switch to opponent turn
    setIsPlayerTurn(false);
    setCurrentTurn('opponent');
    
    // Opponent AI action (delayed for dramatic effect)
    setTimeout(() => {
      performOpponentAction();
    }, 1500);
  };

  // Opponent AI actions
  const performOpponentAction = () => {
    const actions = ['attack', 'defend', 'evade'];
    const weights = [0.6, 0.2, 0.2]; // Prefer attacking
    
    // Choose weighted random action
    const random = Math.random();
    let cumulativeWeight = 0;
    let chosenAction = 'attack';
    
    for (let i = 0; i < actions.length; i++) {
      cumulativeWeight += weights[i];
      if (random < cumulativeWeight) {
        chosenAction = actions[i];
        break;
      }
    }
    
    const isSuccessful = calculateActionSuccess(opponentStats, playerStats, chosenAction);
    let damage = 0;
    let logMessage = '';
    let newPlayerStats = { ...playerStats };
    let newOpponentStats = { ...opponentStats };
    
    // Opponent consumes energy
    newOpponentStats.energy = Math.max(0, newOpponentStats.energy - 15);
    
    switch (chosenAction) {
      case 'attack':
        damage = calculateDamage(opponentStats, playerStats, 'attack', isSuccessful);
        if (isSuccessful) {
          newPlayerStats.hp = Math.max(0, newPlayerStats.hp - damage);
          logMessage = `${matchedPlayer.name} attacks for ${damage} damage!`;
        } else {
          logMessage = `${matchedPlayer.name}'s attack missed!`;
        }
        break;
        
      case 'defend':
        if (isSuccessful) {
          newOpponentStats.defense += 3;
          logMessage = `${matchedPlayer.name} raises defense!`;
        } else {
          logMessage = `${matchedPlayer.name} failed to defend properly!`;
        }
        break;
        
      case 'evade':
        if (isSuccessful) {
          newOpponentStats.speed += 2;
          logMessage = `${matchedPlayer.name} increases agility!`;
        } else {
          logMessage = `${matchedPlayer.name} stumbles while trying to evade!`;
        }
        break;
    }
    
    setPlayerStats(newPlayerStats);
    setOpponentStats(newOpponentStats);
    setBattleLog(prev => [...prev, logMessage]);
    
    // Check if player is defeated
    if (newPlayerStats.hp <= 0) {
      setBattleLog(prev => [...prev, `${playerPet?.name || 'Your Pet'} is defeated! You lose!`]);
      // Validate battle results with server (defeat case)
      validateBattleWithServer({
        playerStats: { ...playerPet?.stats, maxHp: playerPet?.stats?.hp || 100 },
        opponentStats: { ...matchedPlayer.stats, maxHp: matchedPlayer.stats.hp },
        result: {
          victory: false,
          playerId: publicKey?.toString() || 'guest',
          opponentId: matchedPlayer.id,
          playerFinalHp: newPlayerStats.hp,
          opponentFinalHp: newOpponentStats.hp,
          turnsPlayed: battleLog.length
        }
      }).then(validation => {
        const rewards = validation.verified ? validation.rewards : { tokens: 1, exp: 5 };
        setBattleResult({ 
          winner: 'opponent', 
          experience: rewards.exp, 
          tokens: rewards.tokens,
          verified: validation.verified,
          ratingChange: rewards.rating_change
        });
        setBattleState(BATTLE_STATES.COMPLETED);
        
        // Record battle in progression system
        if (publicKey) {
          progressionSystem.recordBattle(
            publicKey.toString(),
            matchedPlayer.id,
            { winner: 'opponent', experience: rewards.exp, tokens: rewards.tokens },
            {
              playerStartHp: playerPet?.stats?.hp || 100,
              playerEndHp: newPlayerStats.hp,
              turnsPlayed: battleLog.length,
              rewards: rewards,
              verified: validation.verified
            }
          );
          
          // Record in leaderboard system  
          leaderboardSystem.recordBattle(
            publicKey.toString(),
            matchedPlayer.id,
            { winner: 'opponent', experience: rewards.exp, tokens: rewards.tokens },
            {
              playerName: playerPet?.name || 'Your Pet',
              opponentName: matchedPlayer.name,
              playerStartHp: playerPet?.stats?.hp || 100,
              playerEndHp: newPlayerStats.hp,
              turnsPlayed: battleLog.length,
              verified: validation.verified
            }
          );
        }
      }).catch(error => {
        console.warn('Battle validation failed, using offline rewards:', error);
        setBattleResult({ winner: 'opponent', experience: 5, tokens: 1, verified: false });
        setBattleState(BATTLE_STATES.COMPLETED);
      });
      
      return;
    }
    
    // Switch back to player turn
    setIsPlayerTurn(true);
    setCurrentTurn('player');
  };

  if (battleState === BATTLE_STATES.SEARCHING) {
    return (
      <div className="p2p-battle-room">
        <div className="search-container">
          <h2>⚔️ Finding Opponent...</h2>
          <div className="search-spinner">
            <div className="spinner"></div>
          </div>
          <p>Searching for players... {searchTime}s</p>
          <p className="search-tip">
            {searchTime < 15 ? 'Searching for real players online...' : 'No players found, preparing AI opponent...'}
          </p>
          <button onClick={onExit} className="btn btn-secondary">
            Cancel Search
          </button>
        </div>
        
        <style>{`
          .p2p-battle-room {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            background: linear-gradient(45deg, #0a0a0a, #1a1a1a);
            border: 2px solid #00ff99;
            border-radius: 12px;
            padding: 2rem;
            text-align: center;
          }
          
          .search-container h2 {
            color: #00ff99;
            margin-bottom: 1rem;
          }
          
          .search-spinner {
            margin: 1rem 0;
          }
          
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(0, 255, 153, 0.3);
            border-top: 4px solid #00ff99;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }
          
          .search-tip {
            color: #888;
            font-size: 0.9rem;
            margin-top: 0.5rem;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (battleState === BATTLE_STATES.MATCHED) {
    return (
      <div className="p2p-battle-room">
        <div className="match-found">
          <h2>🎯 Opponent Found!</h2>
          <div className="opponent-info">
            <h3>{matchedPlayer.name}</h3>
            <p>Species: {matchedPlayer.petSpecies}</p>
            <p>Level: {matchedPlayer.level}</p>
            <p>Rating: {matchedPlayer.rating}</p>
            {matchedPlayer.isMock ? 
              <span className="mock-badge">🤖 AI Opponent</span> :
              <span className="real-badge">🌐 Real Player</span>
            }
          </div>
          <p>Battle starting soon...</p>
        </div>
        
        <style>{`
          .match-found {
            text-align: center;
          }
          
          .opponent-info {
            background: rgba(0, 255, 153, 0.1);
            border: 1px solid rgba(0, 255, 153, 0.3);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
          }
          
          .mock-badge {
            background: #ff6b6b;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.7rem;
            margin-left: 0.5rem;
          }
          
          .real-badge {
            background: #00ff99;
            color: #000;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.7rem;
            margin-left: 0.5rem;
            font-weight: bold;
          }
        `}</style>
      </div>
    );
  }

  if (battleState === BATTLE_STATES.IN_BATTLE) {
    return (
      <div className="p2p-battle-room">
        <div className="battle-interface">
          {/* Battle Status */}
          <div className="battle-status">
            <div className="player-status">
              <h3>{playerPet?.name || 'Your Pet'}</h3>
              <div className="stat-bar">
                <label>HP: {playerStats.hp}</label>
                <div className="bar">
                  <div 
                    className="fill hp-fill" 
                    style={{ width: `${(playerStats.hp / (playerPet?.stats?.hp || 100)) * 100}%` }}
                  />
                </div>
              </div>
              <div className="stat-bar">
                <label>Energy: {playerStats.energy}</label>
                <div className="bar">
                  <div 
                    className="fill energy-fill" 
                    style={{ width: `${playerStats.energy}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="vs-indicator">VS</div>
            
            <div className="opponent-status">
              <h3>{matchedPlayer.name}</h3>
              <div className="stat-bar">
                <label>HP: {opponentStats.hp}</label>
                <div className="bar">
                  <div 
                    className="fill hp-fill" 
                    style={{ width: `${(opponentStats.hp / matchedPlayer.stats.hp) * 100}%` }}
                  />
                </div>
              </div>
              <div className="stat-bar">
                <label>Energy: {opponentStats.energy}</label>
                <div className="bar">
                  <div 
                    className="fill energy-fill" 
                    style={{ width: `${opponentStats.energy}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Battle Log */}
          <div className="battle-log">
            {battleLog.slice(-6).map((log, index) => (
              <div key={index} className="log-entry">{log}</div>
            ))}
          </div>

          {/* Battle Actions */}
          <div className="battle-actions">
            <p className="turn-indicator">
              {isPlayerTurn ? '🎮 Your Turn' : '🤖 Opponent\'s Turn'}
            </p>
            
            {isPlayerTurn && (
              <div className="action-buttons">
                <button 
                  className="btn btn-attack" 
                  onClick={() => performBattleAction('attack')}
                  disabled={playerStats.energy < 15}
                >
                  ⚔️ Attack
                </button>
                <button 
                  className="btn btn-defend" 
                  onClick={() => performBattleAction('defend')}
                  disabled={playerStats.energy < 15}
                >
                  🛡️ Defend
                </button>
                <button 
                  className="btn btn-evade" 
                  onClick={() => performBattleAction('evade')}
                  disabled={playerStats.energy < 15}
                >
                  💨 Evade
                </button>
              </div>
            )}
          </div>
        </div>
        
        <style>{`
          .battle-interface {
            width: 100%;
            max-width: 800px;
          }
          
          .battle-status {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            background: rgba(0, 255, 153, 0.05);
            border: 1px solid rgba(0, 255, 153, 0.2);
            border-radius: 8px;
            padding: 1rem;
          }
          
          .player-status, .opponent-status {
            flex: 1;
          }
          
          .vs-indicator {
            font-size: 2rem;
            font-weight: bold;
            color: #ff6b6b;
            margin: 0 2rem;
          }
          
          .stat-bar {
            margin: 0.5rem 0;
          }
          
          .stat-bar label {
            font-size: 0.8rem;
            color: #ccc;
          }
          
          .bar {
            width: 100%;
            height: 8px;
            background: #333;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 2px;
          }
          
          .fill {
            height: 100%;
            transition: width 0.3s ease;
          }
          
          .hp-fill {
            background: linear-gradient(90deg, #ff4444, #ff6666);
          }
          
          .energy-fill {
            background: linear-gradient(90deg, #4488ff, #66aaff);
          }
          
          .battle-log {
            background: rgba(0, 0, 0, 0.7);
            border: 1px solid #333;
            border-radius: 8px;
            padding: 1rem;
            height: 150px;
            overflow-y: auto;
            margin-bottom: 2rem;
            font-family: monospace;
          }
          
          .log-entry {
            margin: 0.3rem 0;
            color: #ccc;
            animation: fadeIn 0.5s ease;
          }
          
          .battle-actions {
            text-align: center;
          }
          
          .turn-indicator {
            color: #00ff99;
            font-weight: bold;
            margin-bottom: 1rem;
          }
          
          .action-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
          }
          
          .btn-attack {
            background: linear-gradient(45deg, #ff4444, #ff6666);
          }
          
          .btn-defend {
            background: linear-gradient(45deg, #4488ff, #66aaff);
          }
          
          .btn-evade {
            background: linear-gradient(45deg, #ffaa44, #ffcc66);
          }
          
          .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  if (battleState === BATTLE_STATES.COMPLETED) {
    return (
      <div className="p2p-battle-room">
        <div className="battle-results">
          <h2>⚔️ Battle Complete!</h2>
          
          <div className={`result-banner ${battleResult.winner}`}>
            {battleResult.winner === 'player' ? '🎉 Victory!' : '💀 Defeat'}
          </div>
          
          <div className="rewards">
            <h3>Rewards:</h3>
            <p>+{battleResult.experience} Experience</p>
            <p>+{battleResult.tokens} Tokens</p>
          </div>
          
          <div className="battle-summary">
            <p>Opponent: {matchedPlayer.name}</p>
            <p>Turns: {battleLog.length}</p>
            <p>Final HP: {playerStats.hp}</p>
          </div>
          
          <div className="result-actions">
            <button 
              className="btn btn-primary" 
              onClick={() => {
                onBattleComplete?.(battleResult);
                onExit?.();
              }}
            >
              Continue
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                // Reset for another battle
                setBattleState(BATTLE_STATES.SEARCHING);
                setSearchTime(0);
                setMatchedPlayer(null);
                setBattleResult(null);
                setBattleLog([]);
                setPlayerStats({
                  hp: playerPet?.stats?.hp || 100,
                  energy: 100,
                  attack: playerPet?.stats?.attack || 15,
                  defense: playerPet?.stats?.defense || 8,
                  speed: playerPet?.stats?.speed || 12
                });
                setOpponentStats(null);
                setIsPlayerTurn(true);
                setCurrentTurn('player');
              }}
            >
              Battle Again
            </button>
          </div>
        </div>
        
        <style>{`
          .battle-results {
            text-align: center;
          }
          
          .result-banner {
            font-size: 2rem;
            font-weight: bold;
            margin: 1rem 0;
            padding: 1rem;
            border-radius: 8px;
          }
          
          .result-banner.player {
            background: linear-gradient(45deg, #00ff99, #00cc77);
            color: #000;
          }
          
          .result-banner.opponent {
            background: linear-gradient(45deg, #ff4444, #cc3333);
            color: #fff;
          }
          
          .rewards {
            background: rgba(0, 255, 153, 0.1);
            border: 1px solid rgba(0, 255, 153, 0.3);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
          }
          
          .battle-summary {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
            color: #ccc;
          }
          
          .result-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
          }
        `}</style>
      </div>
    );
  }

  return null;
}