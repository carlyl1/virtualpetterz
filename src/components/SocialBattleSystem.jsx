import React, { useState, useEffect, useRef } from 'react';
import { generatePet } from '../generators/petGenerator';
import PetSprite from './PetSprite';
import progressionSystem from '../systems/PersistentProgression';

const BATTLE_PHASES = {
  SELECTION: 'selection',
  PREPARATION: 'preparation', 
  BATTLE: 'battle',
  RESULTS: 'results'
};

const MOVE_TYPES = {
  ATTACK: 'attack',
  DEFEND: 'defend',
  SPECIAL: 'special',
  HEAL: 'heal'
};

const BATTLE_MOVES = {
  // Universal moves
  scratch: { name: 'Scratch', type: MOVE_TYPES.ATTACK, damage: 15, cost: 5, accuracy: 0.95 },
  defend: { name: 'Defend', type: MOVE_TYPES.DEFEND, defense: 20, cost: 3, accuracy: 1.0 },
  rest: { name: 'Rest', type: MOVE_TYPES.HEAL, heal: 25, cost: 0, accuracy: 1.0 },
  
  // Species-specific moves
  'forest-fox': {
    cunning_strike: { name: 'Cunning Strike', type: MOVE_TYPES.ATTACK, damage: 25, cost: 8, accuracy: 0.9 },
    forest_magic: { name: 'Forest Magic', type: MOVE_TYPES.SPECIAL, damage: 30, heal: 10, cost: 12, accuracy: 0.85 }
  },
  'mystic-bunny': {
    cosmic_blast: { name: 'Cosmic Blast', type: MOVE_TYPES.SPECIAL, damage: 35, cost: 15, accuracy: 0.8 },
    healing_light: { name: 'Healing Light', type: MOVE_TYPES.HEAL, heal: 40, cost: 10, accuracy: 1.0 }
  },
  'robo-cat': {
    laser_beam: { name: 'Laser Beam', type: MOVE_TYPES.ATTACK, damage: 28, cost: 10, accuracy: 0.92 },
    system_repair: { name: 'System Repair', type: MOVE_TYPES.HEAL, heal: 35, cost: 12, accuracy: 1.0 }
  },
  'shadow-wolf': {
    shadow_strike: { name: 'Shadow Strike', type: MOVE_TYPES.ATTACK, damage: 32, cost: 12, accuracy: 0.88 },
    intimidate: { name: 'Intimidate', type: MOVE_TYPES.SPECIAL, damage: 0, debuff: 'fear', cost: 8, accuracy: 0.9 }
  },
  'water-duck': {
    splash_attack: { name: 'Splash Attack', type: MOVE_TYPES.ATTACK, damage: 20, cost: 6, accuracy: 0.95 },
    water_heal: { name: 'Water Heal', type: MOVE_TYPES.HEAL, heal: 30, cost: 8, accuracy: 1.0 }
  },
  'pixel-sloth': {
    slow_strike: { name: 'Slow Strike', type: MOVE_TYPES.ATTACK, damage: 18, cost: 4, accuracy: 0.98 },
    zen_meditation: { name: 'Zen Meditation', type: MOVE_TYPES.HEAL, heal: 45, cost: 15, accuracy: 1.0 }
  },
  'chonk-hamster': {
    rolling_attack: { name: 'Rolling Attack', type: MOVE_TYPES.ATTACK, damage: 22, cost: 7, accuracy: 0.93 },
    energy_burst: { name: 'Energy Burst', type: MOVE_TYPES.SPECIAL, damage: 25, cost: 10, accuracy: 0.85 }
  },
  'glitch-moth': {
    reality_tear: { name: 'Reality Tear', type: MOVE_TYPES.SPECIAL, damage: 40, cost: 18, accuracy: 0.75 },
    phase_heal: { name: 'Phase Heal', type: MOVE_TYPES.HEAL, heal: 20, cost: 6, accuracy: 1.0 }
  }
};

function BattlePetDisplay({ pet, hp, maxHp, energy, maxEnergy, isActive, effects = [] }) {
  return (
    <div className={`battle-pet ${isActive ? 'active' : ''}`}>
      <div className="pet-sprite-battle">
        <PetSprite
          petSpecies={pet.species?.toLowerCase().replace(' ', '-') || 'forest-fox'}
          happiness={75}
          hunger={50}
          sleeping={false}
          inBattle={true}
          rarity={pet.rarity}
          width={80}
          height={80}
          showEffects={true}
          enableLayering={true}
        />
        {effects.length > 0 && (
          <div className="battle-effects">
            {effects.map((effect, i) => (
              <div key={i} className={`effect-indicator effect-${effect}`}>
                {effect.toUpperCase()}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="pet-battle-info">
        <div className="pet-name">{pet.species}</div>
        <div className="pet-rarity">{pet.rarity?.toUpperCase()}</div>
        
        <div className="battle-bars">
          <div className="health-bar">
            <div className="bar-label">HP: {hp}/{maxHp}</div>
            <div className="bar">
              <div 
                className="bar-fill health" 
                style={{ width: `${(hp / maxHp) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="energy-bar">
            <div className="bar-label">Energy: {energy}/{maxEnergy}</div>
            <div className="bar">
              <div 
                className="bar-fill energy" 
                style={{ width: `${(energy / maxEnergy) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MoveButton({ move, onClick, disabled, cost, currentEnergy }) {
  const canAfford = currentEnergy >= cost;
  const isDisabled = disabled || !canAfford;
  
  return (
    <button 
      className={`move-button ${move.type} ${isDisabled ? 'disabled' : ''}`}
      onClick={() => onClick(move)}
      disabled={isDisabled}
    >
      <div className="move-name">{move.name}</div>
      <div className="move-details">
        {move.damage && <span>DMG: {move.damage}</span>}
        {move.heal && <span>HEAL: {move.heal}</span>}
        <span>Cost: {cost}</span>
      </div>
    </button>
  );
}

export default function SocialBattleSystem({ playerPet, opponentPet, onBattleEnd, gardenMode = false }) {
  const [phase, setPhase] = useState(BATTLE_PHASES.BATTLE);
  const [playerStats, setPlayerStats] = useState({
    hp: playerPet?.stats?.hp || 100,
    maxHp: playerPet?.stats?.hp || 100,
    energy: 50,
    maxEnergy: 50,
    effects: []
  });
  const [opponentStats, setOpponentStats] = useState({
    hp: opponentPet?.stats?.hp || 90,
    maxHp: opponentPet?.stats?.hp || 90,
    energy: 45,
    maxEnergy: 45,
    effects: []
  });
  const [currentTurn, setCurrentTurn] = useState('player');
  const [battleLog, setBattleLog] = useState([]);
  const [selectedMove, setSelectedMove] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [battleResult, setBattleResult] = useState(null);
  
  // Get available moves for each pet
  const playerMoves = {
    ...{ scratch: BATTLE_MOVES.scratch, defend: BATTLE_MOVES.defend, rest: BATTLE_MOVES.rest },
    ...BATTLE_MOVES[playerPet?.species?.toLowerCase().replace(' ', '-')] || {}
  };
  
  const opponentMoves = {
    ...{ scratch: BATTLE_MOVES.scratch, defend: BATTLE_MOVES.defend, rest: BATTLE_MOVES.rest },
    ...BATTLE_MOVES[opponentPet?.species?.toLowerCase().replace(' ', '-')] || {}
  };

  const addToBattleLog = (message) => {
    setBattleLog(prev => [...prev.slice(-4), message]);
  };

  const executeMove = (attacker, defender, move, attackerStats, defenderStats) => {
    let damage = 0;
    let healing = 0;
    let energyCost = move.cost || 0;
    
    // Calculate accuracy
    const hitRoll = Math.random();
    if (hitRoll > move.accuracy) {
      return {
        hit: false,
        damage: 0,
        healing: 0,
        energyCost,
        message: `${attacker.species}'s ${move.name} missed!`
      };
    }
    
    // Calculate damage
    if (move.damage) {
      const baseDamage = move.damage;
      const attackerBonus = (attacker.stats?.attack || 20) / 20;
      const defenderReduction = Math.max(0.3, 1 - (defender.stats?.defense || 10) / 50);
      
      damage = Math.floor(baseDamage * attackerBonus * defenderReduction);
      
      // Rarity bonus
      if (attacker.rarity === 'legendary') damage *= 1.3;
      else if (attacker.rarity === 'epic') damage *= 1.2;
      else if (attacker.rarity === 'rare') damage *= 1.1;
      
      damage = Math.floor(damage);
    }
    
    // Calculate healing
    if (move.heal) {
      healing = move.heal;
      if (attacker.rarity === 'legendary') healing *= 1.2;
    }
    
    let message = `${attacker.species} used ${move.name}!`;
    if (damage > 0) {
      message += ` Dealt ${damage} damage!`;
    }
    if (healing > 0) {
      message += ` Healed ${healing} HP!`;
    }
    
    return {
      hit: true,
      damage,
      healing,
      energyCost,
      message
    };
  };

  const handlePlayerMove = (move) => {
    if (isAnimating || currentTurn !== 'player') return;
    
    setIsAnimating(true);
    setSelectedMove(move);
    
    const result = executeMove(playerPet, opponentPet, move, playerStats, opponentStats);
    
    setTimeout(() => {
      // Apply move effects
      setOpponentStats(prev => ({
        ...prev,
        hp: Math.max(0, prev.hp - result.damage)
      }));
      
      setPlayerStats(prev => ({
        ...prev,
        hp: Math.min(prev.maxHp, prev.hp + result.healing),
        energy: Math.max(0, prev.energy - result.energyCost)
      }));
      
      addToBattleLog(result.message);
      
      // Check for battle end
      if (opponentStats.hp - result.damage <= 0) {
        setBattleResult('victory');
        setPhase(BATTLE_PHASES.RESULTS);
      } else {
        setCurrentTurn('opponent');
      }
      
      setIsAnimating(false);
    }, 1000);
  };

  // AI opponent turn
  useEffect(() => {
    if (currentTurn === 'opponent' && !isAnimating && phase === BATTLE_PHASES.BATTLE) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
        
        // Simple AI: choose move based on situation
        const availableMoves = Object.values(opponentMoves).filter(
          move => opponentStats.energy >= (move.cost || 0)
        );
        
        let chosenMove;
        if (opponentStats.hp < opponentStats.maxHp * 0.3 && availableMoves.some(m => m.heal)) {
          // Low HP: prioritize healing
          chosenMove = availableMoves.filter(m => m.heal).reduce((best, move) => 
            move.heal > (best?.heal || 0) ? move : best
          );
        } else {
          // Normal: choose attack moves
          const attackMoves = availableMoves.filter(m => m.damage);
          chosenMove = attackMoves[Math.floor(Math.random() * attackMoves.length)] || availableMoves[0];
        }
        
        const result = executeMove(opponentPet, playerPet, chosenMove, opponentStats, playerStats);
        
        setTimeout(() => {
          // Apply move effects
          setPlayerStats(prev => ({
            ...prev,
            hp: Math.max(0, prev.hp - result.damage)
          }));
          
          setOpponentStats(prev => ({
            ...prev,
            hp: Math.min(prev.maxHp, prev.hp + result.healing),
            energy: Math.max(0, prev.energy - result.energyCost)
          }));
          
          addToBattleLog(result.message);
          
          // Check for battle end
          if (playerStats.hp - result.damage <= 0) {
            setBattleResult('defeat');
            setPhase(BATTLE_PHASES.RESULTS);
          } else {
            // Regenerate some energy each turn
            setPlayerStats(prev => ({
              ...prev,
              energy: Math.min(prev.maxEnergy, prev.energy + 8)
            }));
            setOpponentStats(prev => ({
              ...prev,
              energy: Math.min(prev.maxEnergy, prev.energy + 6)
            }));
            
            setCurrentTurn('player');
          }
          
          setIsAnimating(false);
        }, 1000);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [currentTurn, isAnimating, phase, opponentStats.hp, playerStats.hp]);

  const handleBattleExit = () => {
    const rewards = {
      tokens: battleResult === 'victory' ? 15 : 5,
      experience: battleResult === 'victory' ? 25 : 10
    };
    
    // Record battle in progression system
    const result = battleResult === 'victory' ? 'win' : (battleResult === 'defeat' ? 'loss' : 'draw');
    const petId = playerPet?.seed || playerPet?.id || 'unknown';
    const opponentId = opponentPet?.seed || opponentPet?.id || 'opponent';
    
    progressionSystem.recordBattle(petId, opponentId, result, {
      playerStartHp: playerPet?.stats?.hp || 100,
      playerEndHp: playerStats.hp,
      opponentStartHp: opponentPet?.stats?.hp || 100,
      opponentEndHp: opponentStats.hp,
      turnsPlayed: battleLog.length,
      rewards
    });
    
    onBattleEnd?.({ winner: result === 'win' ? 'player' : 'opponent', battleResult, rewards });
  };

  if (phase === BATTLE_PHASES.RESULTS) {
    return (
      <div className="battle-results">
        <h2>{battleResult === 'victory' ? '🏆 Victory!' : '😔 Defeat'}</h2>
        <div className="results-summary">
          <p>{battleResult === 'victory' 
            ? `${playerPet.species} defeated ${opponentPet.species}!` 
            : `${opponentPet.species} defeated ${playerPet.species}!`}
          </p>
          <div className="rewards">
            <div>Tokens Earned: +{battleResult === 'victory' ? 15 : 5}</div>
            <div>Experience: +{battleResult === 'victory' ? 25 : 10}</div>
          </div>
        </div>
        <div className="results-actions">
          <button onClick={handleBattleExit} className="btn">
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="social-battle-system">
      <div className="battle-header">
        <h2>Pet Battle</h2>
        <div className="turn-indicator">
          {currentTurn === 'player' ? 'Your Turn' : 'Opponent Turn'}
        </div>
      </div>
      
      <div className="battle-field">
        <BattlePetDisplay
          pet={playerPet}
          hp={playerStats.hp}
          maxHp={playerStats.maxHp}
          energy={playerStats.energy}
          maxEnergy={playerStats.maxEnergy}
          isActive={currentTurn === 'player'}
          effects={playerStats.effects}
        />
        
        <div className="battle-center">
          <div className="vs-indicator">VS</div>
          {isAnimating && (
            <div className="battle-animation">
              <div className="attack-effect">⚡</div>
            </div>
          )}
        </div>
        
        <BattlePetDisplay
          pet={opponentPet}
          hp={opponentStats.hp}
          maxHp={opponentStats.maxHp}
          energy={opponentStats.energy}
          maxEnergy={opponentStats.maxEnergy}
          isActive={currentTurn === 'opponent'}
          effects={opponentStats.effects}
        />
      </div>
      
      <div className="battle-log">
        <h4>Battle Log</h4>
        <div className="log-messages">
          {battleLog.map((message, index) => (
            <div key={index} className="log-message">
              {message}
            </div>
          ))}
        </div>
      </div>
      
      {currentTurn === 'player' && !isAnimating && (
        <div className="move-selection">
          <h4>Choose Your Move</h4>
          <div className="moves-grid">
            {Object.values(playerMoves).map((move, index) => (
              <MoveButton
                key={index}
                move={move}
                onClick={handlePlayerMove}
                disabled={isAnimating}
                cost={move.cost || 0}
                currentEnergy={playerStats.energy}
              />
            ))}
          </div>
        </div>
      )}
      
      <div className="battle-footer">
        <button onClick={handleBattleExit} className="btn secondary">
          Forfeit Battle
        </button>
      </div>
    </div>
  );
}