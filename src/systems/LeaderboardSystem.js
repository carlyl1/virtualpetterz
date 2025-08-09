// Enhanced leaderboard system with battle ratings and P2P integration
class LeaderboardSystem {
  constructor() {
    this.STORAGE_KEY = 'ct_enhanced_leaderboard';
    this.RATING_SYSTEM = {
      STARTING_RATING: 1200,
      K_FACTOR: 32, // ELO rating system constant
      MIN_RATING: 800,
      MAX_RATING: 3000
    };
  }

  // Initialize player if they don't exist
  initializePlayer(playerId, playerName = 'Anonymous') {
    const leaderboard = this.getLeaderboard();
    
    if (!leaderboard[playerId]) {
      leaderboard[playerId] = {
        id: playerId,
        name: playerName,
        rating: this.RATING_SYSTEM.STARTING_RATING,
        wins: 0,
        losses: 0,
        draws: 0,
        tokens: 0,
        experience: 0,
        battleHistory: [],
        achievements: [],
        rank: 'Novice',
        lastActive: Date.now(),
        joinDate: Date.now()
      };
      
      this.saveLeaderboard(leaderboard);
    }
    
    return leaderboard[playerId];
  }

  // Get current leaderboard data
  getLeaderboard() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.warn('Failed to load leaderboard:', error);
      return {};
    }
  }

  // Save leaderboard data
  saveLeaderboard(leaderboard) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(leaderboard));
    } catch (error) {
      console.error('Failed to save leaderboard:', error);
    }
  }

  // Get player stats
  getPlayerStats(playerId) {
    const leaderboard = this.getLeaderboard();
    return leaderboard[playerId] || null;
  }

  // Calculate new ELO rating after a battle
  calculateEloRating(playerRating, opponentRating, result) {
    const K = this.RATING_SYSTEM.K_FACTOR;
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    
    let actualScore;
    switch (result) {
      case 'win': actualScore = 1; break;
      case 'loss': actualScore = 0; break;
      case 'draw': actualScore = 0.5; break;
      default: actualScore = 0;
    }
    
    const newRating = playerRating + K * (actualScore - expectedScore);
    return Math.max(
      this.RATING_SYSTEM.MIN_RATING, 
      Math.min(this.RATING_SYSTEM.MAX_RATING, Math.round(newRating))
    );
  }

  // Determine rank based on rating
  getRankFromRating(rating) {
    if (rating >= 2400) return 'Grandmaster';
    if (rating >= 2000) return 'Master';
    if (rating >= 1800) return 'Expert';
    if (rating >= 1600) return 'Advanced';
    if (rating >= 1400) return 'Intermediate';
    if (rating >= 1200) return 'Novice';
    return 'Beginner';
  }

  // Record battle result and update ratings
  recordBattle(playerId, opponentId, result, battleData = {}) {
    const leaderboard = this.getLeaderboard();
    
    // Initialize players if needed
    this.initializePlayer(playerId, battleData.playerName);
    this.initializePlayer(opponentId, battleData.opponentName);
    
    const player = leaderboard[playerId];
    const opponent = leaderboard[opponentId];
    
    if (!player || !opponent) {
      console.warn('Failed to find player data for battle recording');
      return false;
    }
    
    // Calculate new ratings
    const playerResult = result.winner === 'player' ? 'win' : result.winner === 'opponent' ? 'loss' : 'draw';
    const opponentResult = result.winner === 'player' ? 'loss' : result.winner === 'opponent' ? 'win' : 'draw';
    
    const oldPlayerRating = player.rating;
    const oldOpponentRating = opponent.rating;
    
    player.rating = this.calculateEloRating(oldPlayerRating, oldOpponentRating, playerResult);
    opponent.rating = this.calculateEloRating(oldOpponentRating, oldPlayerRating, opponentResult);
    
    // Update battle statistics
    if (playerResult === 'win') {
      player.wins++;
      opponent.losses++;
    } else if (playerResult === 'loss') {
      player.losses++;
      opponent.wins++;
    } else {
      player.draws++;
      opponent.draws++;
    }
    
    // Update ranks
    player.rank = this.getRankFromRating(player.rating);
    opponent.rank = this.getRankFromRating(opponent.rating);
    
    // Add rewards
    if (result.tokens) player.tokens = (player.tokens || 0) + result.tokens;
    if (result.experience) player.experience = (player.experience || 0) + result.experience;
    
    // Record battle in history
    const battleRecord = {
      opponent: opponentId,
      opponentName: opponent.name,
      result: playerResult,
      ratingChange: player.rating - oldPlayerRating,
      date: Date.now(),
      ...battleData
    };
    
    player.battleHistory = player.battleHistory || [];
    player.battleHistory.unshift(battleRecord);
    player.battleHistory = player.battleHistory.slice(0, 50); // Keep last 50 battles
    
    // Update last active
    player.lastActive = Date.now();
    opponent.lastActive = Date.now();
    
    // Check for achievements
    this.checkAchievements(player);
    this.checkAchievements(opponent);
    
    this.saveLeaderboard(leaderboard);
    
    return {
      playerRatingChange: player.rating - oldPlayerRating,
      opponentRatingChange: opponent.rating - oldOpponentRating,
      newPlayerRating: player.rating,
      newOpponentRating: opponent.rating
    };
  }

  // Check and award achievements
  checkAchievements(player) {
    const achievements = player.achievements || [];
    const totalBattles = (player.wins || 0) + (player.losses || 0) + (player.draws || 0);
    
    // Battle count achievements
    if (totalBattles >= 1 && !achievements.includes('first_battle')) {
      achievements.push('first_battle');
    }
    if (totalBattles >= 10 && !achievements.includes('veteran')) {
      achievements.push('veteran');
    }
    if (totalBattles >= 100 && !achievements.includes('warrior')) {
      achievements.push('warrior');
    }
    
    // Win streak achievements
    const recentBattles = player.battleHistory?.slice(0, 5) || [];
    const currentWinStreak = recentBattles.takeWhile ? recentBattles.takeWhile(b => b.result === 'win').length : 0;
    
    if (currentWinStreak >= 5 && !achievements.includes('win_streak_5')) {
      achievements.push('win_streak_5');
    }
    
    // Rating achievements
    if (player.rating >= 1600 && !achievements.includes('expert_rank')) {
      achievements.push('expert_rank');
    }
    if (player.rating >= 2000 && !achievements.includes('master_rank')) {
      achievements.push('master_rank');
    }
    
    player.achievements = achievements;
  }

  // Get top players for leaderboard display
  getTopPlayers(limit = 20, sortBy = 'rating') {
    const leaderboard = this.getLeaderboard();
    const players = Object.values(leaderboard);
    
    players.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'wins':
          return (b.wins || 0) - (a.wins || 0);
        case 'tokens':
          return (b.tokens || 0) - (a.tokens || 0);
        case 'winRate':
          const aWinRate = a.wins / Math.max(1, (a.wins + a.losses)) * 100;
          const bWinRate = b.wins / Math.max(1, (b.wins + b.losses)) * 100;
          return bWinRate - aWinRate;
        default:
          return (b.rating || 0) - (a.rating || 0);
      }
    });
    
    return players.slice(0, limit).map((player, index) => ({
      ...player,
      position: index + 1,
      winRate: player.wins / Math.max(1, (player.wins + player.losses)) * 100,
      totalBattles: (player.wins || 0) + (player.losses || 0) + (player.draws || 0)
    }));
  }

  // Get player's rank position
  getPlayerRank(playerId) {
    const topPlayers = this.getTopPlayers(1000, 'rating');
    const playerIndex = topPlayers.findIndex(p => p.id === playerId);
    return playerIndex >= 0 ? playerIndex + 1 : null;
  }

  // Update player profile
  updatePlayerProfile(playerId, updates) {
    const leaderboard = this.getLeaderboard();
    if (leaderboard[playerId]) {
      Object.assign(leaderboard[playerId], updates);
      leaderboard[playerId].lastActive = Date.now();
      this.saveLeaderboard(leaderboard);
      return true;
    }
    return false;
  }

  // Get battle statistics
  getBattleStats(playerId) {
    const player = this.getPlayerStats(playerId);
    if (!player) return null;
    
    const totalBattles = (player.wins || 0) + (player.losses || 0) + (player.draws || 0);
    const winRate = totalBattles > 0 ? (player.wins / totalBattles * 100) : 0;
    
    return {
      ...player,
      totalBattles,
      winRate: Math.round(winRate * 100) / 100,
      averageRatingChange: this.getAverageRatingChange(player),
      currentStreak: this.getCurrentStreak(player),
      bestRating: this.getBestRating(player)
    };
  }

  // Get average rating change from recent battles
  getAverageRatingChange(player) {
    const recentBattles = player.battleHistory?.slice(0, 10) || [];
    if (recentBattles.length === 0) return 0;
    
    const totalChange = recentBattles.reduce((sum, battle) => sum + (battle.ratingChange || 0), 0);
    return Math.round((totalChange / recentBattles.length) * 100) / 100;
  }

  // Get current win/loss streak
  getCurrentStreak(player) {
    const battles = player.battleHistory || [];
    if (battles.length === 0) return { type: 'none', count: 0 };
    
    const firstResult = battles[0].result;
    let count = 0;
    
    for (const battle of battles) {
      if (battle.result === firstResult) {
        count++;
      } else {
        break;
      }
    }
    
    return { 
      type: firstResult, 
      count 
    };
  }

  // Get best rating achieved
  getBestRating(player) {
    const battles = player.battleHistory || [];
    let bestRating = player.rating || this.RATING_SYSTEM.STARTING_RATING;
    
    // Calculate rating at each point in history
    let currentRating = player.rating || this.RATING_SYSTEM.STARTING_RATING;
    
    for (let i = battles.length - 1; i >= 0; i--) {
      const battle = battles[i];
      currentRating -= battle.ratingChange || 0;
      bestRating = Math.max(bestRating, currentRating + (battle.ratingChange || 0));
    }
    
    return bestRating;
  }

  // Clear all leaderboard data (for testing/reset)
  clearLeaderboard() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Create singleton instance
const leaderboardSystem = new LeaderboardSystem();

export default leaderboardSystem;