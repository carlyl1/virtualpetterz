// API Configuration for different environments
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
const isNetlify = window.location.hostname.includes('netlify.app');

// Base API URL configuration
export const API_CONFIG = {
  // In development: use local server
  // In production: use Netlify functions
  BASE_URL: isDevelopment 
    ? 'http://localhost:8787' 
    : '',
  
  // API endpoints
  ENDPOINTS: {
    STATUS: isDevelopment ? '/api/status' : '/.netlify/functions/status',
    LEADERBOARD: isDevelopment ? '/api/leaderboard' : '/.netlify/functions/leaderboard', 
    BATTLE_SIMULATE: isDevelopment ? '/api/battle/simulate' : '/.netlify/functions/battle-simulate',
    BATTLE_VALIDATE: isDevelopment ? '/api/battle/validate' : '/.netlify/functions/battle-validate',
    HEALTH: isDevelopment ? '/health' : '/.netlify/functions/health',
    CHAT: isDevelopment ? '/chat' : '/chat' // Already configured in netlify.toml
  }
};

// Helper function to get full API URL
export function getApiUrl(endpoint) {
  const baseUrl = API_CONFIG.BASE_URL;
  const path = API_CONFIG.ENDPOINTS[endpoint] || endpoint;
  return baseUrl + path;
}

// WebSocket URL (only available in development)
export const WEBSOCKET_URL = isDevelopment ? 'ws://localhost:8787' : null;

console.log('🔧 API Config:', { 
  isDevelopment, 
  isNetlify, 
  baseUrl: API_CONFIG.BASE_URL,
  websocketAvailable: !!WEBSOCKET_URL 
});