// Multiplayer WebSocket service for real-time battles and leaderboards
import { io } from 'socket.io-client';

class MultiplayerService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.eventListeners = new Map();
    this.playerId = null;
  }

  connect(serverUrl = 'http://localhost:8787') {
    if (this.socket) {
      console.log('🔌 Already connected to multiplayer server');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.socket = io(serverUrl, {
          transports: ['websocket'],
          timeout: 5000
        });

        this.socket.on('connect', () => {
          console.log('🌐 Connected to multiplayer server');
          this.connected = true;
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('❌ Disconnected from multiplayer server');
          this.connected = false;
        });

        this.socket.on('connect_error', (error) => {
          console.warn('🔴 Multiplayer connection failed:', error.message);
          this.connected = false;
          // Fall back to local mode
          resolve(); // Don't reject - continue with local gameplay
        });

        // Player registration response
        this.socket.on('player_registered', (data) => {
          this.playerId = data.playerId;
          this.emit('player_registered', data);
        });

        // Battle system events
        this.socket.on('battle_queue_joined', (data) => {
          this.emit('battle_queue_joined', data);
        });

        this.socket.on('battle_found', (data) => {
          this.emit('battle_found', data);
        });

        this.socket.on('battle_update', (data) => {
          this.emit('battle_update', data);
        });

        this.socket.on('battle_result', (data) => {
          this.emit('battle_result', data);
        });

        this.socket.on('opponent_disconnected', (data) => {
          this.emit('opponent_disconnected', data);
        });

        // Leaderboard updates
        this.socket.on('leaderboard_update', (data) => {
          this.emit('leaderboard_update', data);
        });

      } catch (error) {
        console.warn('🔴 Failed to initialize WebSocket:', error);
        resolve(); // Continue without multiplayer
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.playerId = null;
    }
  }

  // Register player with server
  registerPlayer(playerData) {
    if (this.socket && this.connected) {
      this.socket.emit('register_player', playerData);
      return true;
    }
    return false;
  }

  // Battle system
  joinBattleQueue(playerData) {
    if (this.socket && this.connected) {
      this.socket.emit('join_battle_queue', playerData);
      return true;
    }
    return false;
  }

  sendBattleAction(battleId, action) {
    if (this.socket && this.connected) {
      this.socket.emit('battle_action', { battleId, action });
      return true;
    }
    return false;
  }

  // Leaderboard
  requestLeaderboard() {
    if (this.socket && this.connected) {
      this.socket.emit('get_leaderboard');
      return true;
    }
    return false;
  }

  // HTTP API fallback for when WebSocket is not available
  async simulateBattle(player1, player2) {
    try {
      const response = await fetch('http://localhost:8787/api/battle/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ player1, player2 })
      });

      if (!response.ok) {
        throw new Error('Battle simulation failed');
      }

      return await response.json();
    } catch (error) {
      console.warn('Battle simulation error:', error);
      
      // Local fallback simulation
      const victory = Math.random() > 0.4;
      return {
        victory,
        tokens: victory ? 15 : 5,
        exp: victory ? 25 : 10,
        battle: {
          winner: victory ? 'player1' : 'player2',
          history: [{ turn: 1, action: { type: 'attack', success: true } }]
        }
      };
    }
  }

  async getLeaderboard() {
    try {
      const response = await fetch('http://localhost:8787/api/leaderboard');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Failed to fetch leaderboard:', error);
    }
    
    // Return empty leaderboard on failure
    return [];
  }

  async getServerStatus() {
    try {
      const response = await fetch('http://localhost:8787/api/status');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Failed to get server status:', error);
    }
    
    return { status: 'offline', hasSocketIO: false };
  }

  // Event system
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  isConnected() {
    return this.connected;
  }

  getPlayerId() {
    return this.playerId;
  }
}

// Export singleton instance
const multiplayerService = new MultiplayerService();
export default multiplayerService;