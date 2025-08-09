import React, { useState, useEffect } from 'react';
import progressionSystem from '../systems/PersistentProgression';

export default function StatsBoard({ selectedPet, walletConnected }) {
  const [playerStats, setPlayerStats] = useState(null);
  const [petStats, setPetStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    loadStats();
  }, [selectedPet]);

  const loadStats = () => {
    const playerData = progressionSystem.getPlayerStats();
    setPlayerStats(playerData);
    
    if (selectedPet) {
      const petSeed = walletConnected ? `wallet-${selectedPet}` : `guest-${selectedPet}`;
      const petData = progressionSystem.getPetStats(petSeed);
      setPetStats(petData);
    }
    
    const topPets = progressionSystem.getLeaderboard('level');
    setLeaderboard(topPets);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (!playerStats) return <div>Loading stats...</div>;

  return (
    <div className="stats-board">
      <div className="stats-header">
        <h2>Trainer Dashboard</h2>
        <div className="stats-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pet' ? 'active' : ''}`}
            onClick={() => setActiveTab('pet')}
            disabled={!petStats}
          >
            Current Pet
          </button>
          <button 
            className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            Achievements
          </button>
          <button 
            className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            Leaderboard
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="stats-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <h3>Trainer Level</h3>
                <div className="stat-value">{playerStats.level}</div>
              </div>
              <div className="stat-detail">
                Experience: {playerStats.experience}
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${(playerStats.experience % 200) / 2}%` 
                  }}
                />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <h3>Total Pets</h3>
                <div className="stat-value">{playerStats.totalPets}</div>
              </div>
              <div className="stat-detail">
                Hatched: {playerStats.statistics.totalHatchedPets}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <h3>Battle Record</h3>
                <div className="stat-value">
                  {playerStats.battlesWon}W/{playerStats.battlesLost}L
                </div>
              </div>
              <div className="stat-detail">
                Win Rate: {playerStats.battlesWon + playerStats.battlesLost > 0 
                  ? Math.round((playerStats.battlesWon / (playerStats.battlesWon + playerStats.battlesLost)) * 100)
                  : 0}%
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <h3>Expeditions</h3>
                <div className="stat-value">{playerStats.expeditionsCompleted}</div>
              </div>
              <div className="stat-detail">
                Total completed
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <h3>Tokens Earned</h3>
                <div className="stat-value">{playerStats.tokens.total}</div>
              </div>
              <div className="stat-detail">
                Battle: {playerStats.tokens.battle || 0} | 
                Expedition: {playerStats.tokens.expedition || 0}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <h3>Activity Streaks</h3>
                <div className="stat-value">{playerStats.statistics.streaks.daily}</div>
              </div>
              <div className="stat-detail">
                Daily streak (days)
              </div>
            </div>
          </div>

          <div className="favorite-species">
            <h3>Favorite Species</h3>
            <div className="species-list">
              {Object.entries(playerStats.statistics.favoriteSpecies || {})
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([species, count]) => (
                  <div key={species} className="species-item">
                    <span className="species-name">{species}</span>
                    <span className="species-count">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pet' && petStats && (
        <div className="stats-content">
          <div className="pet-overview">
            <h3>{petStats.species} ({petStats.rarity})</h3>
            <div className="pet-level">Level {petStats.level}</div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${(petStats.experience % 100) / 1}%` 
                }}
              />
            </div>
            <p>Hatched: {formatDate(petStats.hatchDate)}</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h4>Battle Stats</h4>
              <div className="battle-record">
                <div>Wins: {petStats.battleRecord.wins}</div>
                <div>Losses: {petStats.battleRecord.losses}</div>
                <div>Draws: {petStats.battleRecord.draws}</div>
              </div>
            </div>

            <div className="stat-card">
              <h4>Expedition Record</h4>
              <div>
                <div>Completed: {petStats.expeditionRecord.completed}</div>
                <div>Successful: {petStats.expeditionRecord.successful}</div>
                <div>Success Rate: {
                  petStats.expeditionRecord.completed > 0 
                    ? Math.round((petStats.expeditionRecord.successful / petStats.expeditionRecord.completed) * 100)
                    : 0
                }%</div>
              </div>
            </div>

            <div className="stat-card">
              <h4>Pet Stats</h4>
              <div>
                <div>HP: {petStats.stats.hp}</div>
                <div>Attack: {petStats.stats.attack}</div>
                <div>Defense: {petStats.stats.defense}</div>
                <div>Speed: {petStats.stats.speed}</div>
              </div>
            </div>
          </div>

          <div className="milestones">
            <h4>Milestones</h4>
            <div className="milestone-list">
              {petStats.milestones.firstBattle && (
                <div className="milestone">
                  First Battle: {formatDate(petStats.milestones.firstBattle)}
                </div>
              )}
              {petStats.milestones.firstWin && (
                <div className="milestone">
                  First Win: {formatDate(petStats.milestones.firstWin)}
                </div>
              )}
              {petStats.milestones.firstExpedition && (
                <div className="milestone">
                  First Expedition: {formatDate(petStats.milestones.firstExpedition)}
                </div>
              )}
              {petStats.milestones.levelMilestones.slice(-3).map((milestone, index) => (
                <div key={index} className="milestone">
                  Reached Level {milestone.level}: {formatDate(milestone.date)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="stats-content">
          <div className="achievements-grid">
            {playerStats.achievements.map(achievementId => {
              const achievement = getAchievementDetails(achievementId);
              return (
                <div key={achievementId} className="achievement-card earned">
                  <div className="achievement-icon">🏆</div>
                  <div className="achievement-name">{achievement.name}</div>
                  <div className="achievement-description">{achievement.description}</div>
                </div>
              );
            })}
            
            {/* Show some unearned achievements */}
            {getUnlockedAchievements().map(achievement => (
              <div key={achievement.id} className="achievement-card locked">
                <div className="achievement-icon">🔒</div>
                <div className="achievement-name">{achievement.name}</div>
                <div className="achievement-description">{achievement.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="stats-content">
          <h3>Top Pets by Level</h3>
          <div className="leaderboard-list">
            {leaderboard.map((pet, index) => (
              <div key={pet.id} className="leaderboard-item">
                <div className="rank">#{index + 1}</div>
                <div className="pet-info">
                  <div className="pet-name">{pet.species}</div>
                  <div className="pet-details">
                    Level {pet.level} • {pet.rarity}
                  </div>
                </div>
                <div className="pet-stats">
                  <div>Battles: {pet.battleRecord.wins}W</div>
                  <div>Expeditions: {pet.expeditionRecord.successful}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getAchievementDetails(achievementId) {
  const achievements = {
    'first_hatch': { name: 'First Pet', description: 'Hatch your first pet' },
    'battle_rookie': { name: 'Battle Rookie', description: 'Win your first battle' },
    'battle_veteran': { name: 'Battle Veteran', description: 'Win 10 battles' },
    'battle_champion': { name: 'Battle Champion', description: 'Win 50 battles' },
    'explorer': { name: 'Explorer', description: 'Complete your first expedition' },
    'adventurer': { name: 'Adventurer', description: 'Complete 10 expeditions' },
    'level_up_5': { name: 'Growing Strong', description: 'Reach level 5' },
    'level_up_10': { name: 'Elite Pet', description: 'Reach level 10' },
    'daily_streak_7': { name: 'Dedicated Trainer', description: 'Maintain a 7-day activity streak' },
    'legendary_pet': { name: 'Legendary Trainer', description: 'Hatch a legendary pet' }
  };
  
  return achievements[achievementId] || { name: 'Unknown', description: 'Hidden achievement' };
}

function getUnlockedAchievements() {
  return [
    { id: 'battle_master', name: 'Battle Master', description: 'Win 100 battles' },
    { id: 'expedition_master', name: 'Expedition Master', description: 'Complete 50 expeditions' },
    { id: 'collector', name: 'Collector', description: 'Hatch pets of all 8 species' },
    { id: 'legendary_collector', name: 'Legendary Collector', description: 'Hatch 3 legendary pets' }
  ].slice(0, 4);
}