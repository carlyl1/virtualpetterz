// Persistent Progression & Stats System
export class PersistentProgression {
  constructor() {
    this.storageKey = 'ct_progression_data';
    this.init();
  }

  init() {
    if (!localStorage.getItem(this.storageKey)) {
      const initialData = {
        version: '1.0.0',
        pets: {},
        player: {
          joinDate: Date.now(),
          totalPlayTime: 0,
          expeditionsCompleted: 0,
          battlesWon: 0,
          battlesLost: 0,
          achievements: [],
          level: 1,
          experience: 0,
          tokens: {
            daily: 0,
            battle: 0,
            expedition: 0,
            total: 0
          }
        },
        statistics: {
          totalHatchedPets: 0,
          totalBattles: 0,
          totalExpeditions: 0,
          favoriteSpecies: {},
          dailyActivity: {},
          streaks: {
            daily: 0,
            battle: 0,
            expedition: 0
          }
        }
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
    }
  }

  getData() {
    return JSON.parse(localStorage.getItem(this.storageKey));
  }

  saveData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // Pet progression tracking
  registerPet(pet) {
    const data = this.getData();
    const petId = pet.seed || pet.id;
    
    if (!data.pets[petId]) {
      data.pets[petId] = {
        id: petId,
        species: pet.species,
        rarity: pet.rarity,
        hatchDate: Date.now(),
        level: 1,
        experience: 0,
        stats: { ...pet.stats },
        battleRecord: { wins: 0, losses: 0, draws: 0 },
        expeditionRecord: { completed: 0, successful: 0 },
        achievements: [],
        totalPlayTime: 0,
        happinessHistory: [],
        hungerHistory: [],
        milestones: {
          firstBattle: null,
          firstWin: null,
          firstExpedition: null,
          maxHappiness: null,
          levelMilestones: []
        }
      };
      
      data.statistics.totalHatchedPets++;
      data.statistics.favoriteSpecies[pet.species] = (data.statistics.favoriteSpecies[pet.species] || 0) + 1;
      
      this.saveData(data);
      this.checkAchievements(petId);
    }
    
    return data.pets[petId];
  }

  // Experience and leveling system
  addExperience(petId, amount, source = 'general') {
    const data = this.getData();
    if (!data.pets[petId]) return false;

    const pet = data.pets[petId];
    const oldLevel = pet.level;
    pet.experience += amount;
    
    // Level calculation (exponential growth)
    const newLevel = Math.floor(Math.sqrt(pet.experience / 100)) + 1;
    
    if (newLevel > oldLevel) {
      pet.level = newLevel;
      pet.stats.hp += 5 * (newLevel - oldLevel);
      pet.stats.attack += 2 * (newLevel - oldLevel);
      pet.stats.defense += 2 * (newLevel - oldLevel);
      pet.stats.speed += 1 * (newLevel - oldLevel);
      
      pet.milestones.levelMilestones.push({
        level: newLevel,
        date: Date.now(),
        statsGain: {
          hp: 5 * (newLevel - oldLevel),
          attack: 2 * (newLevel - oldLevel),
          defense: 2 * (newLevel - oldLevel),
          speed: 1 * (newLevel - oldLevel)
        }
      });
    }
    
    // Also add to player experience
    data.player.experience += Math.floor(amount / 2);
    const playerNewLevel = Math.floor(Math.sqrt(data.player.experience / 200)) + 1;
    if (playerNewLevel > data.player.level) {
      data.player.level = playerNewLevel;
    }
    
    this.saveData(data);
    this.logActivity('experience', { petId, amount, source, levelUp: newLevel > oldLevel });
    
    if (newLevel > oldLevel) {
      this.checkAchievements(petId);
    }
    
    return { levelUp: newLevel > oldLevel, newLevel, expGained: amount };
  }

  // Battle system integration
  recordBattle(petId, opponentPetId, result, battleData = {}) {
    const data = this.getData();
    if (!data.pets[petId]) return false;

    const pet = data.pets[petId];
    data.statistics.totalBattles++;
    
    if (!pet.milestones.firstBattle) {
      pet.milestones.firstBattle = Date.now();
    }
    
    switch(result) {
      case 'win':
        pet.battleRecord.wins++;
        data.player.battlesWon++;
        data.statistics.streaks.battle++;
        this.addExperience(petId, 50, 'battle_win');
        this.awardTokens(petId, 'battle', 10);
        
        if (!pet.milestones.firstWin) {
          pet.milestones.firstWin = Date.now();
        }
        break;
        
      case 'loss':
        pet.battleRecord.losses++;
        data.player.battlesLost++;
        data.statistics.streaks.battle = 0;
        this.addExperience(petId, 15, 'battle_loss');
        this.awardTokens(petId, 'battle', 2);
        break;
        
      case 'draw':
        pet.battleRecord.draws++;
        this.addExperience(petId, 25, 'battle_draw');
        this.awardTokens(petId, 'battle', 5);
        break;
    }
    
    this.saveData(data);
    this.logActivity('battle', { petId, opponentPetId, result, ...battleData });
    this.checkAchievements(petId);
    
    return true;
  }

  // Expedition system integration
  recordExpedition(petId, expeditionData, result) {
    const data = this.getData();
    if (!data.pets[petId]) return false;

    const pet = data.pets[petId];
    pet.expeditionRecord.completed++;
    data.player.expeditionsCompleted++;
    data.statistics.totalExpeditions++;
    
    if (!pet.milestones.firstExpedition) {
      pet.milestones.firstExpedition = Date.now();
    }
    
    if (result.success) {
      pet.expeditionRecord.successful++;
      data.statistics.streaks.expedition++;
      this.addExperience(petId, 75, 'expedition_success');
      this.awardTokens(petId, 'expedition', 15);
    } else {
      data.statistics.streaks.expedition = 0;
      this.addExperience(petId, 25, 'expedition_attempt');
      this.awardTokens(petId, 'expedition', 5);
    }
    
    this.saveData(data);
    this.logActivity('expedition', { petId, expeditionData, result });
    this.checkAchievements(petId);
    
    return true;
  }

  // Token system
  awardTokens(petId, source, amount) {
    const data = this.getData();
    data.player.tokens[source] = (data.player.tokens[source] || 0) + amount;
    data.player.tokens.total += amount;
    this.saveData(data);
    
    this.logActivity('tokens', { petId, source, amount });
  }

  // Daily activity tracking
  logActivity(type, activityData = {}) {
    const data = this.getData();
    const today = new Date().toDateString();
    
    if (!data.statistics.dailyActivity[today]) {
      data.statistics.dailyActivity[today] = {
        battles: 0,
        expeditions: 0,
        experience: 0,
        tokens: 0,
        activities: []
      };
      
      // Check for daily streak
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      if (data.statistics.dailyActivity[yesterday]) {
        data.statistics.streaks.daily++;
      } else {
        data.statistics.streaks.daily = 1;
      }
    }
    
    const dailyData = data.statistics.dailyActivity[today];
    dailyData.activities.push({
      type,
      timestamp: Date.now(),
      data: activityData
    });
    
    // Update daily counters
    switch(type) {
      case 'battle':
        dailyData.battles++;
        break;
      case 'expedition':
        dailyData.expeditions++;
        break;
      case 'experience':
        dailyData.experience += activityData.amount || 0;
        break;
      case 'tokens':
        dailyData.tokens += activityData.amount || 0;
        break;
    }
    
    this.saveData(data);
  }

  // Achievement system
  checkAchievements(petId) {
    const data = this.getData();
    const pet = data.pets[petId];
    if (!pet) return;

    const achievements = [
      {
        id: 'first_hatch',
        name: 'First Pet',
        description: 'Hatch your first pet',
        condition: () => data.statistics.totalHatchedPets >= 1,
        reward: { tokens: 25, experience: 100 }
      },
      {
        id: 'battle_rookie',
        name: 'Battle Rookie',
        description: 'Win your first battle',
        condition: () => pet.battleRecord.wins >= 1,
        reward: { tokens: 15, experience: 50 }
      },
      {
        id: 'battle_veteran',
        name: 'Battle Veteran',
        description: 'Win 10 battles',
        condition: () => pet.battleRecord.wins >= 10,
        reward: { tokens: 100, experience: 250 }
      },
      {
        id: 'battle_champion',
        name: 'Battle Champion',
        description: 'Win 50 battles',
        condition: () => pet.battleRecord.wins >= 50,
        reward: { tokens: 500, experience: 1000 }
      },
      {
        id: 'explorer',
        name: 'Explorer',
        description: 'Complete your first expedition',
        condition: () => pet.expeditionRecord.completed >= 1,
        reward: { tokens: 20, experience: 75 }
      },
      {
        id: 'adventurer',
        name: 'Adventurer',
        description: 'Complete 10 expeditions',
        condition: () => pet.expeditionRecord.completed >= 10,
        reward: { tokens: 150, experience: 500 }
      },
      {
        id: 'level_up_5',
        name: 'Growing Strong',
        description: 'Reach level 5',
        condition: () => pet.level >= 5,
        reward: { tokens: 50, experience: 200 }
      },
      {
        id: 'level_up_10',
        name: 'Elite Pet',
        description: 'Reach level 10',
        condition: () => pet.level >= 10,
        reward: { tokens: 150, experience: 500 }
      },
      {
        id: 'daily_streak_7',
        name: 'Dedicated Trainer',
        description: 'Maintain a 7-day activity streak',
        condition: () => data.statistics.streaks.daily >= 7,
        reward: { tokens: 100, experience: 300 }
      },
      {
        id: 'legendary_pet',
        name: 'Legendary Trainer',
        description: 'Hatch a legendary pet',
        condition: () => pet.rarity === 'legendary',
        reward: { tokens: 200, experience: 500 }
      }
    ];

    achievements.forEach(achievement => {
      const alreadyEarned = pet.achievements.includes(achievement.id) || 
                           data.player.achievements.includes(achievement.id);
      
      if (!alreadyEarned && achievement.condition()) {
        pet.achievements.push(achievement.id);
        if (!data.player.achievements.includes(achievement.id)) {
          data.player.achievements.push(achievement.id);
        }
        
        // Award achievement rewards
        if (achievement.reward.tokens) {
          this.awardTokens(petId, 'achievement', achievement.reward.tokens);
        }
        if (achievement.reward.experience) {
          this.addExperience(petId, achievement.reward.experience, 'achievement');
        }
        
        this.logActivity('achievement', { 
          petId, 
          achievementId: achievement.id,
          achievement: achievement.name,
          reward: achievement.reward 
        });
      }
    });

    this.saveData(data);
  }

  // Stats and analytics
  getPetStats(petId) {
    const data = this.getData();
    return data.pets[petId] || null;
  }

  getPlayerStats() {
    const data = this.getData();
    return {
      ...data.player,
      statistics: data.statistics,
      totalPets: Object.keys(data.pets).length
    };
  }

  getLeaderboard(type = 'level') {
    const data = this.getData();
    const pets = Object.values(data.pets);
    
    switch(type) {
      case 'level':
        return pets.sort((a, b) => b.level - a.level).slice(0, 10);
      case 'battles':
        return pets.sort((a, b) => b.battleRecord.wins - a.battleRecord.wins).slice(0, 10);
      case 'expeditions':
        return pets.sort((a, b) => b.expeditionRecord.successful - a.expeditionRecord.successful).slice(0, 10);
      default:
        return pets.slice(0, 10);
    }
  }

  // Data export/import
  exportData() {
    return JSON.stringify(this.getData(), null, 2);
  }

  importData(dataString) {
    try {
      const importedData = JSON.parse(dataString);
      // Validate data structure
      if (importedData.version && importedData.pets && importedData.player) {
        this.saveData(importedData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Cleanup old data
  cleanup(daysToKeep = 30) {
    const data = this.getData();
    const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    
    // Clean up daily activity data
    Object.keys(data.statistics.dailyActivity).forEach(dateString => {
      const date = new Date(dateString);
      if (date.getTime() < cutoffDate) {
        delete data.statistics.dailyActivity[dateString];
      }
    });
    
    this.saveData(data);
  }
}

// Singleton instance
export const progressionSystem = new PersistentProgression();
export default progressionSystem;