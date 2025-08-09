// Unified Pet Stats & Progression System
// Handles experience, leveling, stat growth, and rewards

export class UnifiedProgressionSystem {
  constructor() {
    this.storageKey = 'ct_unified_progression';
    this.data = this.loadData();
  }

  loadData() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : this.getDefaultData();
    } catch {
      return this.getDefaultData();
    }
  }

  getDefaultData() {
    return {
      petStats: {
        level: 1,
        experience: 0,
        hp: 100,
        attack: 15,
        defense: 10,
        speed: 12,
        happiness: 65,
        hunger: 65
      },
      playerStats: {
        tokens: 25,
        battlesWon: 0,
        battlesLost: 0,
        adventuresCompleted: 0,
        questsCompleted: 0,
        totalEarnings: 0,
        dayStreak: 0,
        lastLogin: Date.now()
      },
      achievements: [],
      inventory: {}
    };
  }

  saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }

  // Pet level and experience system
  getExperienceForLevel(level) {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  levelUpPet() {
    const currentLevel = this.data.petStats.level;
    const requiredExp = this.getExperienceForLevel(currentLevel + 1);
    
    if (this.data.petStats.experience >= requiredExp) {
      this.data.petStats.level++;
      this.data.petStats.experience -= requiredExp;
      
      // Stat increases on level up
      const statGains = {
        hp: Math.floor(Math.random() * 15) + 10,
        attack: Math.floor(Math.random() * 5) + 3,
        defense: Math.floor(Math.random() * 4) + 2,
        speed: Math.floor(Math.random() * 3) + 2
      };
      
      Object.keys(statGains).forEach(stat => {
        this.data.petStats[stat] += statGains[stat];
      });
      
      // Bonus tokens for leveling
      const tokenReward = currentLevel * 5 + 10;
      this.addTokens(tokenReward);
      
      this.checkAchievements();
      this.saveData();
      
      return {
        leveledUp: true,
        newLevel: this.data.petStats.level,
        statGains,
        tokenReward
      };
    }
    
    return { leveledUp: false };
  }

  addExperience(amount) {
    this.data.petStats.experience += amount;
    const levelResult = this.levelUpPet();
    this.saveData();
    return levelResult;
  }

  // Token system
  addTokens(amount) {
    this.data.playerStats.tokens += amount;
    this.data.playerStats.totalEarnings += amount;
    this.saveData();
  }

  spendTokens(amount) {
    if (this.data.playerStats.tokens >= amount) {
      this.data.playerStats.tokens -= amount;
      this.saveData();
      return true;
    }
    return false;
  }

  // Battle results
  recordBattleResult(won, tokensEarned = 0, expEarned = 0) {
    if (won) {
      this.data.playerStats.battlesWon++;
      this.addTokens(tokensEarned);
      this.addExperience(expEarned);
    } else {
      this.data.playerStats.battlesLost++;
      // Small consolation prize for losing
      this.addTokens(Math.floor(tokensEarned / 4));
      this.addExperience(Math.floor(expEarned / 2));
    }
    
    this.checkAchievements();
    this.saveData();
  }

  // Adventure completion
  recordAdventure(success, difficulty, rewards) {
    if (success) {
      this.data.playerStats.adventuresCompleted++;
      const baseTokens = difficulty * 3;
      const bonusTokens = Math.floor(Math.random() * difficulty * 2);
      const expReward = difficulty * 8;
      
      this.addTokens(baseTokens + bonusTokens);
      this.addExperience(expReward);
    }
    
    this.checkAchievements();
    this.saveData();
  }

  // Pet care system
  updatePetNeeds(hunger, happiness) {
    this.data.petStats.hunger = Math.max(0, Math.min(100, hunger));
    this.data.petStats.happiness = Math.max(0, Math.min(100, happiness));
    this.saveData();
  }

  feedPet(foodItem = { hunger: 20, happiness: 5 }) {
    this.data.petStats.hunger = Math.min(100, this.data.petStats.hunger + foodItem.hunger);
    this.data.petStats.happiness = Math.min(100, this.data.petStats.happiness + foodItem.happiness);
    this.saveData();
  }

  playWithPet(playActivity = { happiness: 15, hunger: -5 }) {
    this.data.petStats.happiness = Math.min(100, this.data.petStats.happiness + playActivity.happiness);
    this.data.petStats.hunger = Math.max(0, this.data.petStats.hunger + playActivity.hunger);
    this.saveData();
  }

  // Achievement system
  checkAchievements() {
    const newAchievements = [];
    
    // Battle achievements
    if (this.data.playerStats.battlesWon >= 10 && !this.hasAchievement('warrior')) {
      newAchievements.push({ id: 'warrior', name: 'Warrior', description: 'Won 10 battles', reward: 50 });
    }
    
    if (this.data.playerStats.battlesWon >= 50 && !this.hasAchievement('champion')) {
      newAchievements.push({ id: 'champion', name: 'Champion', description: 'Won 50 battles', reward: 200 });
    }
    
    // Adventure achievements
    if (this.data.playerStats.adventuresCompleted >= 25 && !this.hasAchievement('explorer')) {
      newAchievements.push({ id: 'explorer', name: 'Explorer', description: 'Completed 25 adventures', reward: 100 });
    }
    
    // Level achievements
    if (this.data.petStats.level >= 10 && !this.hasAchievement('trainer')) {
      newAchievements.push({ id: 'trainer', name: 'Trainer', description: 'Reached level 10', reward: 150 });
    }
    
    // Token achievements
    if (this.data.playerStats.totalEarnings >= 1000 && !this.hasAchievement('wealthy')) {
      newAchievements.push({ id: 'wealthy', name: 'Wealthy', description: 'Earned 1000+ tokens', reward: 250 });
    }
    
    // Add new achievements and give rewards
    newAchievements.forEach(achievement => {
      this.data.achievements.push(achievement);
      this.addTokens(achievement.reward);
    });
    
    return newAchievements;
  }

  hasAchievement(id) {
    return this.data.achievements.some(a => a.id === id);
  }

  // Daily login system
  checkDailyLogin() {
    const now = Date.now();
    const lastLogin = this.data.playerStats.lastLogin;
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if (now - lastLogin > oneDayMs) {
      // New day
      if (now - lastLogin < oneDayMs * 2) {
        // Consecutive day
        this.data.playerStats.dayStreak++;
      } else {
        // Streak broken
        this.data.playerStats.dayStreak = 1;
      }
      
      // Daily login reward
      const streakBonus = Math.min(this.data.playerStats.dayStreak, 7);
      const dailyReward = 10 + (streakBonus * 2);
      this.addTokens(dailyReward);
      
      this.data.playerStats.lastLogin = now;
      this.saveData();
      
      return {
        isNewDay: true,
        streak: this.data.playerStats.dayStreak,
        reward: dailyReward
      };
    }
    
    return { isNewDay: false };
  }

  // Get computed stats for battles
  getBattleStats() {
    const base = this.data.petStats;
    const level = base.level;
    
    // Happiness and hunger affect combat performance
    const happinessMultiplier = Math.max(0.7, base.happiness / 100);
    const hungerPenalty = base.hunger < 30 ? 0.8 : 1.0;
    
    return {
      hp: Math.floor(base.hp * happinessMultiplier),
      attack: Math.floor(base.attack * happinessMultiplier * hungerPenalty),
      defense: Math.floor(base.defense * happinessMultiplier),
      speed: Math.floor(base.speed * happinessMultiplier * hungerPenalty),
      level
    };
  }

  // Get all data for display
  getAllData() {
    return {
      ...this.data,
      battleStats: this.getBattleStats(),
      nextLevelExp: this.getExperienceForLevel(this.data.petStats.level + 1),
      winRate: this.data.playerStats.battlesWon + this.data.playerStats.battlesLost > 0 ? 
        Math.floor((this.data.playerStats.battlesWon / (this.data.playerStats.battlesWon + this.data.playerStats.battlesLost)) * 100) : 0
    };
  }

  // Reset system (for testing)
  reset() {
    this.data = this.getDefaultData();
    this.saveData();
  }
}

// Export singleton instance
const unifiedProgression = new UnifiedProgressionSystem();
export default unifiedProgression;