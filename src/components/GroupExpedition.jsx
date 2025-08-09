import React, { useState, useEffect, useRef } from 'react';
import { generatePet } from '../generators/petGenerator';
import { generateAdventure } from '../generators/adventureGenerator';
import PetSprite from './PetSprite';

const EXPEDITION_PHASES = {
  FORMING: 'forming',
  ADVENTURING: 'adventuring', 
  RESULTS: 'results'
};

const PARTY_ROLES = {
  LEADER: 'leader',
  SCOUT: 'scout',
  SUPPORT: 'support',
  GUARDIAN: 'guardian'
};

function PetPartyMember({ pet, role, isLeader, onRoleChange }) {
  return (
    <div className="party-member">
      <div
        style={{ 
          border: isLeader ? '2px solid #FFD700' : '1px solid #666',
          borderRadius: '4px',
          padding: '2px',
          background: 'rgba(0, 0, 0, 0.3)'
        }}
      >
        <PetSprite
          petSpecies={pet.species?.toLowerCase().replace(' ', '-') || 'forest-fox'}
          happiness={75}
          hunger={50}
          sleeping={false}
          inBattle={false}
          rarity={pet.rarity}
          width={48}
          height={48}
          showEffects={true}
          enableLayering={true}
        />
      </div>
      <div className="member-info">
        <div className="member-name">{pet.species}</div>
        <div className="member-role">
          <select 
            value={role} 
            onChange={(e) => onRoleChange(pet.seed, e.target.value)}
            disabled={!isLeader}
          >
            <option value={PARTY_ROLES.LEADER}>Leader</option>
            <option value={PARTY_ROLES.SCOUT}>Scout</option>
            <option value={PARTY_ROLES.SUPPORT}>Support</option>
            <option value={PARTY_ROLES.GUARDIAN}>Guardian</option>
          </select>
        </div>
        <div className="member-stats">
          <span>HP: {pet.stats.hp}</span>
          <span>ATK: {pet.stats.attack}</span>
          <span>DEF: {pet.stats.defense}</span>
          <span>SPD: {pet.stats.speed}</span>
        </div>
      </div>
    </div>
  );
}

function AdventurePhase({ adventure, party, onChoose, choices, votes, timeLeft }) {
  return (
    <div className="adventure-phase">
      <div className="adventure-story">
        <h3>{adventure.title}</h3>
        <p>{adventure.story}</p>
        <div className="adventure-details">
          <span className="difficulty">Difficulty: {adventure.difficulty}</span>
          <span className="biome">Biome: {adventure.biome}</span>
          <span className="timer">Time left: {timeLeft}s</span>
        </div>
      </div>
      
      <div className="party-display">
        <h4>Your Expedition Party</h4>
        <div className="party-grid">
          {party.map((member, index) => (
            <div key={member.pet.seed} className="party-member-mini">
              <PetSprite
                petSpecies={member.pet.species?.toLowerCase().replace(' ', '-') || 'forest-fox'}
                happiness={75}
                hunger={50}
                sleeping={false}
                inBattle={false}
                rarity={member.pet.rarity}
                width={32}
                height={32}
                showEffects={false}
                enableLayering={true}
                style={{ imageRendering: 'pixelated' }}
              />
              <div className="member-role-badge">{member.role}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="adventure-choices">
        <h4>What should your party do?</h4>
        <div className="choices-grid">
          {choices.map((choice, index) => (
            <button
              key={index}
              className={`choice-btn ${votes[choice] ? 'voted' : ''}`}
              onClick={() => onChoose(choice)}
              disabled={!!Object.keys(votes).length}
            >
              <div className="choice-text">{choice}</div>
              <div className="vote-count">{votes[choice] || 0} votes</div>
            </button>
          ))}
        </div>
      </div>

      <div className="voting-status">
        {Object.keys(votes).length > 0 && (
          <p>Waiting for other party members to vote...</p>
        )}
      </div>
    </div>
  );
}

export default function GroupExpedition({ initialParty = [], expeditionId, onExit, walletConnected = false }) {
  const [phase, setPhase] = useState(EXPEDITION_PHASES.FORMING);
  const [party, setParty] = useState(initialParty.map(pet => ({ 
    pet, 
    role: PARTY_ROLES.LEADER 
  })));
  const [partyRoles, setPartyRoles] = useState({});
  const [adventure, setAdventure] = useState(null);
  const [choices, setChoices] = useState([]);
  const [votes, setVotes] = useState({});
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [expeditionCode, setExpeditionCode] = useState(expeditionId || Math.random().toString(36).substring(7));

  // Generate party pets if none provided
  useEffect(() => {
    if (party.length === 0) {
      const defaultParty = [];
      for (let i = 0; i < 3; i++) {
        const pet = generatePet(`expedition-${expeditionCode}-${i}`);
        defaultParty.push({ 
          pet, 
          role: i === 0 ? PARTY_ROLES.LEADER : PARTY_ROLES.SCOUT 
        });
      }
      setParty(defaultParty);
    }
  }, [expeditionCode]);

  // Timer countdown
  useEffect(() => {
    if (phase === EXPEDITION_PHASES.ADVENTURING && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Auto-resolve when time runs out
            resolveAdventure();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase, timeLeft]);

  const handleRoleChange = (petSeed, newRole) => {
    setParty(prev => prev.map(member => 
      member.pet.seed === petSeed 
        ? { ...member, role: newRole }
        : member
    ));
  };

  const startExpedition = () => {
    // Generate adventure based on party composition
    const partySeed = party.map(m => m.pet.seed).join('-');
    const newAdventure = generateAdventure(partySeed);
    
    // Generate choices based on party roles
    const roleBasedChoices = [];
    if (party.some(m => m.role === PARTY_ROLES.SCOUT)) {
      roleBasedChoices.push("Scout ahead stealthily");
    }
    if (party.some(m => m.role === PARTY_ROLES.GUARDIAN)) {
      roleBasedChoices.push("Form defensive formation");
    }
    if (party.some(m => m.role === PARTY_ROLES.SUPPORT)) {
      roleBasedChoices.push("Use support abilities");
    }
    roleBasedChoices.push("Charge in boldly", "Retreat and regroup");

    setAdventure(newAdventure);
    setChoices(roleBasedChoices.slice(0, 4));
    setPhase(EXPEDITION_PHASES.ADVENTURING);
    setTimeLeft(60);
  };

  const makeChoice = (choice) => {
    setVotes(prev => ({ ...prev, [choice]: (prev[choice] || 0) + 1 }));
    
    // For demo, auto-resolve after first vote
    setTimeout(() => {
      resolveAdventure();
    }, 2000);
  };

  const resolveAdventure = () => {
    // Calculate results based on party stats and choices
    const partyStats = party.reduce((acc, member) => ({
      hp: acc.hp + member.pet.stats.hp,
      attack: acc.attack + member.pet.stats.attack,
      defense: acc.defense + member.pet.stats.defense,
      speed: acc.speed + member.pet.stats.speed
    }), { hp: 0, attack: 0, defense: 0, speed: 0 });

    const success = partyStats.hp > 200; // Basic success calculation
    
    const expeditionResults = {
      success,
      rewards: success ? adventure.rewards : { tokens: 5, experience: 10 },
      story: success 
        ? `Your party successfully completed the expedition! ${adventure.successText || 'You found great treasures!'}`
        : `The expedition was challenging but your party learned valuable lessons. ${adventure.failureText || 'You retreat safely with some experience.'}`,
      partyChanges: party.map(member => ({
        pet: member.pet,
        experienceGained: success ? 25 : 10,
        statsIncrease: success ? { hp: 5, attack: 2 } : { hp: 2 }
      }))
    };

    setResults(expeditionResults);
    setPhase(EXPEDITION_PHASES.RESULTS);
  };

  const addPetToParty = () => {
    if (party.length >= 6) {
      alert('Maximum party size is 6 pets!');
      return;
    }
    
    const newPet = generatePet(`party-${Date.now()}`);
    setParty(prev => [...prev, { pet: newPet, role: PARTY_ROLES.SUPPORT }]);
  };

  const removePetFromParty = (petSeed) => {
    if (party.length <= 1) {
      alert('Party must have at least 1 pet!');
      return;
    }
    setParty(prev => prev.filter(member => member.pet.seed !== petSeed));
  };

  const shareExpeditionCode = async () => {
    const url = `${window.location.origin}#expedition-${expeditionCode}`;
    try {
      await navigator.clipboard.writeText(url);
      alert('Expedition link copied! Share with friends to join your party.');
    } catch {
      alert(`Share this expedition code: ${expeditionCode}`);
    }
  };

  return (
    <div className="group-expedition">
      <div className="expedition-header">
        <h2>Group Expedition</h2>
        <div className="expedition-info">
          <span>Code: {expeditionCode}</span>
          <span>Phase: {phase}</span>
          <span>Party Size: {party.length}</span>
        </div>
      </div>

      {phase === EXPEDITION_PHASES.FORMING && (
        <div className="party-formation">
          <h3>Form Your Expedition Party</h3>
          <div className="party-members">
            {party.map((member, index) => (
              <div key={member.pet.seed} className="party-member-container">
                <PetPartyMember
                  pet={member.pet}
                  role={member.role}
                  isLeader={index === 0}
                  onRoleChange={handleRoleChange}
                />
                {party.length > 1 && (
                  <button 
                    className="remove-pet"
                    onClick={() => removePetFromParty(member.pet.seed)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="party-actions">
            <button onClick={addPetToParty} disabled={party.length >= 6}>
              Add Pet to Party
            </button>
            <button onClick={shareExpeditionCode}>
              Share Expedition
            </button>
            <button 
              onClick={startExpedition}
              disabled={party.length === 0}
              className="start-expedition"
            >
              Start Expedition!
            </button>
          </div>
        </div>
      )}

      {phase === EXPEDITION_PHASES.ADVENTURING && adventure && (
        <AdventurePhase
          adventure={adventure}
          party={party}
          onChoose={makeChoice}
          choices={choices}
          votes={votes}
          timeLeft={timeLeft}
        />
      )}

      {phase === EXPEDITION_PHASES.RESULTS && results && (
        <div className="expedition-results">
          <h3>{results.success ? '🎉 Expedition Success!' : '📚 Expedition Complete'}</h3>
          <div className="results-story">
            <p>{results.story}</p>
          </div>
          
          <div className="rewards-section">
            <h4>Rewards</h4>
            <div className="rewards">
              <span>Tokens: +{results.rewards.tokens}</span>
              <span>Experience: +{results.rewards.experience}</span>
            </div>
          </div>

          <div className="party-results">
            <h4>Party Changes</h4>
            <div className="party-changes">
              {results.partyChanges.map((change, index) => (
                <div key={index} className="pet-changes">
                  <span>{change.pet.species}</span>
                  <span>+{change.experienceGained} XP</span>
                </div>
              ))}
            </div>
          </div>

          <div className="results-actions">
            <button onClick={() => setPhase(EXPEDITION_PHASES.FORMING)}>
              New Expedition
            </button>
            <button onClick={onExit}>Back to Garden</button>
          </div>
        </div>
      )}

      <div className="expedition-footer">
        <button onClick={onExit}>Exit Expedition</button>
      </div>
    </div>
  );
}