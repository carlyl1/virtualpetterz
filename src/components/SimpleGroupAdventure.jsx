import React, { useState, useEffect } from 'react'
import multiplayerService from '../services/MultiplayerService'
import { generateGroupAdventure } from '../generators/adventureGenerator'

export default function SimpleGroupAdventure({ walletPubkey, onExit }) {
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [roomId, setRoomId] = useState('')
  const [players, setPlayers] = useState([])
  const [currentAdventure, setCurrentAdventure] = useState(null)
  const [adventureResult, setAdventureResult] = useState(null)
  const [connectionAttempted, setConnectionAttempted] = useState(false)

  // Real room creation with fallback
  const createRoom = () => {
    setIsCreatingRoom(true)
    
    // Try to create real multiplayer room
    if (multiplayerService.isConnected()) {
      console.log('🌐 Creating real multiplayer room...')
      // For now, use the working mock system since server doesn't have group adventure endpoints yet
      // TODO: Implement when server has group adventure support
      setTimeout(() => {
        const roomId = `ROOM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
        setRoomId(roomId)
        setPlayers([{ 
          id: walletPubkey || 'guest', 
          name: 'You',
          ready: false
        }])
        setIsCreatingRoom(false)
        console.log('✅ Room created:', roomId)
      }, 1000)
    } else {
      console.log('🤖 Creating local room (no multiplayer connection)')
      setTimeout(() => {
        const roomId = `LOCAL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
        setRoomId(roomId)
        setPlayers([{ 
          id: walletPubkey || 'guest', 
          name: 'You',
          ready: false
        }])
        setIsCreatingRoom(false)
      }, 1000)
    }
  }

  // Mock join room
  const joinRoom = (inputRoomId) => {
    if (!inputRoomId.trim()) return
    setRoomId(inputRoomId)
    setPlayers([
      { id: 'mock-player-1', name: 'AdventureSeeker', ready: true },
      { id: walletPubkey || 'guest', name: 'You', ready: false }
    ])
  }

  // Rich adventure generation
  const startAdventure = () => {
    console.log('🎯 Starting group adventure with', players.length, 'players')
    const adventure = generateGroupAdventure(players.length)
    
    setCurrentAdventure({
      title: `Group Adventure: ${adventure.biome.name}`,
      description: adventure.story,
      choices: [
        { id: 1, text: 'Take the cautious approach', votes: 0 },
        { id: 2, text: 'Act boldly and decisively', votes: 0 },
        { id: 3, text: 'Try to find a creative solution', votes: 0 }
      ],
      generatedAdventure: adventure // Store full adventure data
    })
  }

  // Mock voting
  const vote = (choiceId) => {
    setCurrentAdventure(prev => ({
      ...prev,
      choices: prev.choices.map(choice => 
        choice.id === choiceId 
          ? { ...choice, votes: choice.votes + 1 }
          : choice
      )
    }))

    // Auto-complete after voting
    setTimeout(() => {
      setAdventureResult({
        success: Math.random() > 0.3,
        rewards: {
          tokens: Math.floor(Math.random() * 50) + 10,
          experience: Math.floor(Math.random() * 100) + 25
        },
        story: 'Your group decided to explore deeper into the caves and discovered ancient treasures!'
      })
      setCurrentAdventure(null)
    }, 2000)
  }

  const reset = () => {
    setRoomId('')
    setPlayers([])
    setCurrentAdventure(null)
    setAdventureResult(null)
  }

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      background: 'rgba(0, 0, 0, 0.8)',
      borderRadius: '12px',
      border: '1px solid rgba(0, 255, 153, 0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: '#00ff99', margin: 0 }}>🗺️ Group Adventure</h2>
        <button onClick={onExit} className="btn btn-secondary">← Back</button>
      </div>

      {!roomId && !adventureResult && (
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Join or Create Adventure Room</h3>
          
          <div style={{ marginBottom: '2rem' }}>
            <button 
              onClick={createRoom} 
              disabled={isCreatingRoom}
              className="btn btn-primary"
              style={{ margin: '0.5rem' }}
            >
              {isCreatingRoom ? 'Creating...' : '🚀 Create New Room'}
            </button>
          </div>

          <div style={{ margin: '2rem 0' }}>
            <input
              type="text"
              placeholder="Enter Room ID (e.g., ROOM-ABC123)"
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid rgba(0, 255, 153, 0.3)',
                background: 'rgba(0, 0, 0, 0.5)',
                color: '#fff',
                marginRight: '1rem',
                minWidth: '200px'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') joinRoom(e.target.value)
              }}
            />
            <button 
              onClick={(e) => {
                const input = e.target.previousElementSibling
                joinRoom(input.value)
              }}
              className="btn btn-secondary"
            >
              🚪 Join Room
            </button>
          </div>
        </div>
      )}

      {roomId && !currentAdventure && !adventureResult && (
        <div>
          <div style={{ 
            background: 'rgba(0, 255, 153, 0.1)', 
            padding: '1rem', 
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            <h3 style={{ color: '#00ff99' }}>Room: {roomId}</h3>
            <p style={{ color: '#ccc' }}>Players in room:</p>
            {players.map(player => (
              <div key={player.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '0.5rem',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '4px',
                margin: '0.25rem 0'
              }}>
                <span style={{ color: '#fff' }}>{player.name}</span>
                <span style={{ color: player.ready ? '#00ff99' : '#ff9999' }}>
                  {player.ready ? '✅ Ready' : '⏳ Waiting'}
                </span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button onClick={startAdventure} className="btn btn-primary">
              🎯 Start Adventure
            </button>
            <button 
              onClick={reset} 
              className="btn btn-secondary"
              style={{ marginLeft: '1rem' }}
            >
              🔄 Leave Room
            </button>
          </div>
        </div>
      )}

      {currentAdventure && (
        <div>
          <div style={{ 
            background: 'rgba(0, 100, 200, 0.1)', 
            padding: '1.5rem', 
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            <h3 style={{ color: '#4dd0e1' }}>{currentAdventure.title}</h3>
            <p style={{ color: '#ccc' }}>{currentAdventure.description}</p>
          </div>

          <h4 style={{ color: '#fff' }}>Choose your path:</h4>
          {currentAdventure.choices.map(choice => (
            <div 
              key={choice.id}
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(0, 255, 153, 0.3)',
                borderRadius: '8px',
                padding: '1rem',
                margin: '0.5rem 0',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => vote(choice.id)}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(0, 255, 153, 0.1)'
                e.target.style.borderColor = 'rgba(0, 255, 153, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(0, 0, 0, 0.4)'
                e.target.style.borderColor = 'rgba(0, 255, 153, 0.3)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#fff' }}>{choice.text}</span>
                <span style={{ color: '#00ff99' }}>Votes: {choice.votes}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {adventureResult && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            background: adventureResult.success 
              ? 'rgba(0, 255, 153, 0.1)' 
              : 'rgba(255, 100, 100, 0.1)',
            border: `1px solid ${adventureResult.success ? '#00ff99' : '#ff6666'}`,
            borderRadius: '8px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ 
              color: adventureResult.success ? '#00ff99' : '#ff6666',
              marginBottom: '1rem'
            }}>
              {adventureResult.success ? '🎉 Success!' : '💀 Adventure Failed'}
            </h3>
            <p style={{ color: '#ccc', marginBottom: '1rem' }}>
              {adventureResult.story}
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '2rem',
              marginTop: '1rem'
            }}>
              <div>
                <strong style={{ color: '#ffd700' }}>+{adventureResult.rewards.tokens} Tokens</strong>
              </div>
              <div>
                <strong style={{ color: '#ff6b6b' }}>+{adventureResult.rewards.experience} XP</strong>
              </div>
            </div>
          </div>

          <button onClick={reset} className="btn btn-primary">
            🎯 New Adventure
          </button>
        </div>
      )}
    </div>
  )
}