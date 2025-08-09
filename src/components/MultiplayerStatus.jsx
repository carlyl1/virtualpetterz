import React, { useState, useEffect } from 'react';
import multiplayerService from '../services/MultiplayerService';

export default function MultiplayerStatus() {
  const [connected, setConnected] = useState(false);
  const [playersOnline, setPlayersOnline] = useState(0);

  useEffect(() => {
    const checkStatus = () => {
      setConnected(multiplayerService.isConnected());
      
      // Get server status
      multiplayerService.getServerStatus().then(status => {
        if (status.players !== undefined) {
          setPlayersOnline(status.players);
        }
      }).catch(() => {
        setPlayersOnline(0);
      });
    };

    // Check immediately
    checkStatus();
    
    // Check every 10 seconds
    const interval = setInterval(checkStatus, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      zIndex: 1000,
      padding: '8px 12px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      background: connected ? 
        'linear-gradient(135deg, #00ff9920, #00cc7720)' : 
        'linear-gradient(135deg, #33333320, #55555520)',
      border: `1px solid ${connected ? '#00ff9950' : '#55555550'}`,
      backdropFilter: 'blur(10px)',
      color: connected ? '#00ff99' : '#888'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: connected ? '#00ff99' : '#666',
        animation: connected ? 'pulse 2s infinite' : 'none'
      }} />
      
      {connected ? (
        <>
          <span>🌐 Online</span>
          {playersOnline > 0 && (
            <span style={{ color: '#ccc' }}>({playersOnline} players)</span>
          )}
        </>
      ) : (
        <span>⚡ Local Mode</span>
      )}
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}