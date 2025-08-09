import React, { useState } from 'react';
import { generateAdventure, generateGroupAdventure } from '../generators/adventureGenerator';

export default function AdventurePanel({ pet, updatePetStats, giveTokens }) {
  const [adventure, setAdventure] = useState(generateAdventure());
  const [status, setStatus] = useState('idle');
  const [isGroup, setIsGroup] = useState(false);
  const [completedAdventures, setCompletedAdventures] = useState(0);

  const generateNew = () => {
    const seed = Date.now() + Math.random();
    const newAdventure = isGroup ? 
      generateGroupAdventure(Math.floor(Math.random() * 3) + 2, seed) : 
      generateAdventure(seed);
    setAdventure(newAdventure);
    setStatus('idle');
  };

  const startAdventure = async () => {
    setStatus('running');
    
    try {
      // Calculate success based on real pet stats vs adventure requirements
      const petLevel = pet?.level || 1;
      const petPower = (pet?.stats?.attack || 10) + (pet?.stats?.defense || 10) + (pet?.stats?.speed || 10);
      const adventureDifficulty = adventure.difficulty * 15;
      
      // More sophisticated success calculation
      const levelAdvantage = Math.max(0, petLevel - adventure.difficulty) * 5;
      const statAdvantage = Math.max(0, petPower - adventureDifficulty);
      const baseSuccess = 0.3; // Minimum success chance
      const successChance = Math.min(0.95, baseSuccess + (levelAdvantage + statAdvantage) / 100);
      
      // Real-time adventure progression (not just a timeout)
      const progressSteps = Math.max(3, adventure.difficulty);
      const stepDuration = 800; // Shorter, more engaging
      
      for (let step = 0; step < progressSteps; step++) {
        await new Promise(resolve => setTimeout(resolve, stepDuration));
        
        // Allow user to see progress
        const progress = ((step + 1) / progressSteps * 100);
        setStatus(`running-${Math.floor(progress)}`);
        
        // Early failure possibility for harder adventures
        if (step > 1 && Math.random() < (adventure.difficulty - petLevel) * 0.05) {
          setStatus('failure');
          return;
        }
      }
      
      // Final success determination
      const success = Math.random() < successChance;
      setStatus(success ? 'success' : 'failure');
      
      if (success) {
        // Calculate rewards based on adventure difficulty and pet performance
        const difficultyMultiplier = 1 + (adventure.difficulty - 1) * 0.5;
        const performanceBonus = successChance > 0.8 ? 1.2 : 1.0;
        
        const baseTokens = Math.floor(adventure.difficulty * 3);
        const bonusTokens = Math.floor(Math.random() * (adventure.difficulty + 1));
        const tokenReward = Math.floor((baseTokens + bonusTokens) * difficultyMultiplier * performanceBonus);
        
        const baseExp = adventure.difficulty * 8;
        const expGain = Math.floor(baseExp * difficultyMultiplier);
        
        // Apply rewards through proper systems
        giveTokens?.(tokenReward);
        updatePetStats?.({
          experience: expGain
        });
        
        setCompletedAdventures(prev => prev + 1);
        
        // Save adventure completion to localStorage for persistence
        const completedKey = `ct_adventures_completed_${pet?.name || 'unnamed'}`;
        const currentCompleted = Number(localStorage.getItem(completedKey) || '0');
        localStorage.setItem(completedKey, String(currentCompleted + 1));
      }
    } catch (error) {
      console.error('Adventure failed:', error);
      setStatus('error');
    }
  };

  const getDifficultyColor = (diff) => {
    if (diff <= 2) return '#00ff99';
    if (diff <= 4) return '#ffaa00';
    return '#ff4444';
  };

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{color:'#00ff99'}}>Adventure</h3>
        <div style={{ fontSize: 10, color: '#888' }}>
          Completed: {completedAdventures}
        </div>
      </div>
      
      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <button 
          className={`btn ${!isGroup ? 'active' : ''}`}
          onClick={() => setIsGroup(false)}
          style={{ 
            fontSize: 10, 
            padding: '4px 8px',
            background: !isGroup ? '#00ff9930' : '#333'
          }}
        >
          Solo
        </button>
        <button 
          className={`btn ${isGroup ? 'active' : ''}`}
          onClick={() => setIsGroup(true)}
          style={{ 
            fontSize: 10, 
            padding: '4px 8px',
            background: isGroup ? '#00ff9930' : '#333'
          }}
        >
          Group
        </button>
      </div>
      
      <div style={{
        fontSize: 11, 
        color: '#ccc',
        maxHeight: '200px',
        overflowY: 'auto',
        marginBottom: 12,
        padding: 8,
        background: '#1a1a1a',
        borderRadius: 4,
        border: '1px solid #333'
      }} 
    >
      {adventure.story}
    </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 8 
      }}>
        <div style={{ fontSize: 10, color: '#888' }}>
          Difficulty: <span style={{ color: getDifficultyColor(adventure.difficulty) }}>
            {'★'.repeat(Math.min(5, adventure.difficulty))}
          </span>
        </div>
        <div style={{ fontSize: 10, color: '#888' }}>
          Type: {adventure.type || 'solo'}
        </div>
      </div>
      
      <div style={{marginTop:8, display: 'flex', gap: 8}}>
        <button 
          className="btn" 
          onClick={generateNew}
          disabled={status.startsWith('running')}
          style={{ flex: 1 }}
        >
          New Adventure
        </button>
        <button 
          className="btn" 
          style={{ flex: 1, background: status === 'running' ? '#666' : '#00ff9950' }}
          onClick={startAdventure}
          disabled={status.startsWith('running')}
        >
          {status.startsWith('running') ? 'Adventuring...' : 'Send Pet'}
        </button>
      </div>
      
      <div style={{
        marginTop: 8, 
        color: status === 'success' ? '#00ff99' : status === 'failure' ? '#ff4444' : status === 'error' ? '#ff6666' : '#ccc',
        fontSize: 11,
        textAlign: 'center'
      }}>
        {status.startsWith('running-') ? (
          <div>
            <div>🗺️ Adventure in Progress...</div>
            <div style={{ 
              width: '100%', 
              height: '4px', 
              background: '#333', 
              borderRadius: '2px',
              marginTop: '4px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${status.split('-')[1] || 0}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00ff99, #00cc77)',
                transition: 'width 0.5s ease'
              }} />
            </div>
            <div style={{ fontSize: 10, marginTop: 2, opacity: 0.8 }}>
              {status.split('-')[1] || 0}% Complete
            </div>
          </div>
        ) : status === 'success' ? (
          <div>
            <div>✅ Adventure Successful!</div>
            <div style={{ fontSize: 10, marginTop: 4, color: '#00ff99' }}>
              🎁 Earned rewards based on pet stats and performance!
            </div>
          </div>
        ) : status === 'failure' ? (
          <div>
            <div>❌ Adventure Failed</div>
            <div style={{ fontSize: 10, marginTop: 4, opacity: 0.8 }}>
              Your pet wasn't quite ready for this challenge. Try leveling up!
            </div>
          </div>
        ) : status === 'error' ? (
          <div>⚠️ Adventure Error</div>
        ) : status === 'running' ? (
          <div>🗺️ Preparing adventure...</div>
        ) : (
          <div>Ready for adventure</div>
        )}
      </div>
    </div>
  )
}
