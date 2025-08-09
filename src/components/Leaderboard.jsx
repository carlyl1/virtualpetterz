import React, { useEffect, useState } from 'react'
import multiplayerService from '../services/MultiplayerService'
import progressionSystem from '../systems/PersistentProgression'
import leaderboardSystem from '../systems/LeaderboardSystem'

// Generate fallback entries when no real data is available
function generateFallbackEntries() {
  const names = [
    'PixelMaster', 'CryptoNinja', 'QuantumPet', 'DataDragon', 
    'CodeWizard', 'BinaryBeast', 'MemeFox', 'SolanaSloth'
  ];
  
  return names.slice(0, 5).map((name, i) => ({
    name,
    wins: Math.floor(Math.random() * 20) + (5 - i) * 3,
    tokens: Math.floor(Math.random() * 100) + (5 - i) * 20,
    battles: Math.floor(Math.random() * 30) + (5 - i) * 4,
    winRate: Math.floor((Math.random() * 0.3 + 0.4 + (5 - i) * 0.05) * 100),
    petSpecies: ['Fox', 'Bunny', 'Cat', 'Duck', 'Wolf'][i % 5],
    isPlayer: false,
    isFallback: true
  }));
}

export default function Leaderboard({ onClose, playerData }) {
  const [entries, setEntries] = useState([])
  const [sortBy, setSortBy] = useState('tokens')

  useEffect(() => {
    const loadLeaderboard = async () => {
      let allEntries = [];
      
      // Try to get real leaderboard data first
      try {
        console.log('📊 Loading real leaderboard data...');
        
        // Try multiplayer service first
        const serverLeaderboard = await multiplayerService.getLeaderboard();
        if (serverLeaderboard && serverLeaderboard.length > 0) {
          console.log('✅ Got server leaderboard:', serverLeaderboard.length, 'entries');
          allEntries = serverLeaderboard.map(entry => ({
            ...entry,
            isPlayer: false,
            isFallback: false
          }));
        } else {
          // Try local leaderboard system
          const localLeaderboard = leaderboardSystem.getLeaderboard();
          if (localLeaderboard && localLeaderboard.length > 0) {
            console.log('✅ Got local leaderboard:', localLeaderboard.length, 'entries');
            allEntries = localLeaderboard.map(entry => ({
              name: entry.playerName || `Player${entry.playerId}`,
              wins: entry.wins || 0,
              tokens: entry.tokens || 0,
              battles: entry.battles || 0,
              winRate: entry.battles > 0 ? Math.floor((entry.wins / entry.battles) * 100) : 0,
              petSpecies: entry.petSpecies || 'Fox',
              isPlayer: false,
              isFallback: false
            }));
          }
        }
      } catch (error) {
        console.warn('⚠️ Failed to load real leaderboard:', error);
      }
      
      // Add current player data if available
      if (playerData) {
        const playerEntry = {
          name: playerData.name || 'You',
          wins: playerData.wins || 0,
          tokens: playerData.tokens || 0,
          battles: playerData.battles || 0,
          winRate: playerData.battles > 0 ? Math.floor((playerData.wins / playerData.battles) * 100) : 0,
          petSpecies: playerData.petSpecies || 'Fox',
          isPlayer: true,
          isFallback: false
        };
        allEntries.push(playerEntry);
      }
      
      // If no real data, use fallback
      if (allEntries.length === 0 || (allEntries.length === 1 && allEntries[0].isPlayer)) {
        console.log('🤖 Using fallback leaderboard data');
        const fallbackEntries = generateFallbackEntries();
        allEntries = allEntries.concat(fallbackEntries);
      }
      
      // Sort by selected criteria
      const sorted = allEntries.sort((a, b) => {
        switch(sortBy) {
          case 'wins': return b.wins - a.wins;
          case 'winRate': return b.winRate - a.winRate;
          case 'battles': return b.battles - a.battles;
          default: return b.tokens - a.tokens;
        }
      });
      
      setEntries(sorted.slice(0, 15));
    };
    
    loadLeaderboard();
  }, [playerData, sortBy])

  const getRankIcon = (rank) => {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return `${rank + 1}`;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1a1a1a', border: '4px solid #00ff99', borderRadius: 12, padding: 16, width: 'min(92vw, 660px)' }}>
        <h2 style={{ marginTop: 0, color: '#00ff99' }}>🏆 Global Leaderboard</h2>
        
        <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ color: '#888', fontSize: 12, alignSelf: 'center' }}>Sort by:</span>
          {['tokens', 'wins', 'winRate', 'battles'].map(criteria => (
            <button
              key={criteria}
              onClick={() => setSortBy(criteria)}
              style={{
                fontSize: 10,
                padding: '4px 8px',
                background: sortBy === criteria ? '#00ff9930' : '#333',
                border: '1px solid #555',
                borderRadius: 4,
                color: '#ccc',
                cursor: 'pointer'
              }}
            >
              {criteria === 'winRate' ? 'Win Rate' : criteria.charAt(0).toUpperCase() + criteria.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table style={{ width: '100%', fontSize: 11, color: '#b8ffe6' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#1a1a1a' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 4px' }}>Rank</th>
                <th style={{ textAlign: 'left' }}>Player</th>
                <th style={{ textAlign: 'center' }}>Pet</th>
                <th style={{ textAlign: 'center' }}>Wins</th>
                <th style={{ textAlign: 'center' }}>Rate</th>
                <th style={{ textAlign: 'center' }}>Tokens</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr key={i} style={{ 
                  background: entry.isPlayer ? '#00ff9915' : 'transparent',
                  border: entry.isPlayer ? '1px solid #00ff9930' : 'none'
                }}>
                  <td style={{ padding: '8px 4px', fontWeight: entry.isPlayer ? 'bold' : 'normal' }}>
                    {getRankIcon(i)}
                  </td>
                  <td style={{ fontWeight: entry.isPlayer ? 'bold' : 'normal', color: entry.isPlayer ? '#00ff99' : '#b8ffe6' }}>
                    {entry.name} {entry.isPlayer && '(You)'}
                  </td>
                  <td style={{ textAlign: 'center', fontSize: 10, color: '#888' }}>
                    {entry.petSpecies}
                  </td>
                  <td style={{ textAlign: 'center' }}>{entry.wins}</td>
                  <td style={{ textAlign: 'center', color: entry.winRate >= 70 ? '#00ff99' : entry.winRate >= 50 ? '#ffaa00' : '#ff6666' }}>
                    {entry.winRate}%
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: entry.isPlayer ? 'bold' : 'normal' }}>
                    {entry.tokens}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 12, fontSize: 10, color: '#666', textAlign: 'center' }}>
          💡 Battle other players to climb the ranks and earn tokens!
        </div>
        
        <div style={{ marginTop: 12 }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}