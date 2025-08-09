import React, { useState, useEffect } from 'react'

const rarityColors = {
  common: '#4ade80',    // Green
  rare: '#3b82f6',      // Blue
  epic: '#8b5cf6',      // Purple
  legendary: '#f59e0b'   // Orange
}

const rarityGlow = {
  common: '#4ade8044',
  rare: '#3b82f644', 
  epic: '#8b5cf644',
  legendary: '#f59e0b44'
}

const elementColors = {
  fire: '#ef4444',
  water: '#3b82f6',
  earth: '#84cc16',
  air: '#06b6d4',
  void: '#8b5cf6',
  light: '#fbbf24'
}

export default function HatchReveal({ petData, onDone }) {
  const [isVisible, setIsVisible] = useState(false)
  const [showStats, setShowStats] = useState(false)
  
  useEffect(() => {
    // Delayed entrance animation
    const timer1 = setTimeout(() => setIsVisible(true), 300)
    const timer2 = setTimeout(() => setShowStats(true), 1200)
    const timer3 = setTimeout(() => {
      if (onDone) onDone()
    }, 4000)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [onDone])
  
  if (!petData) {
    return null
  }
  
  const { species = 'fox', element = 'void', rarity = 'common', traits = {} } = petData
  
  return (
    <>
      <style>
        {`
          @keyframes revealGlow {
            0% { box-shadow: 0 0 0px ${rarityGlow[rarity]}; transform: scale(0.8); opacity: 0; }
            50% { box-shadow: 0 0 40px ${rarityGlow[rarity]}; }
            100% { box-shadow: 0 0 20px ${rarityGlow[rarity]}; transform: scale(1); opacity: 1; }
          }
          
          @keyframes pulse {
            0%, 100% { box-shadow: 0 0 20px ${rarityGlow[rarity]}; }
            50% { box-shadow: 0 0 40px ${rarityGlow[rarity]}; }
          }
          
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
            50% { opacity: 1; transform: scale(1) rotate(180deg); }
          }
          
          .reveal-panel {
            animation: revealGlow 1.5s ease-out;
            animation-fill-mode: both;
          }
          
          .reveal-panel.visible {
            animation: pulse 3s ease-in-out infinite;
          }
          
          .stat-item {
            animation: fadeInUp 0.6s ease-out;
            animation-fill-mode: both;
          }
          
          .sparkle {
            animation: sparkle 2s ease-in-out infinite;
            animation-delay: var(--delay, 0s);
          }
        `}
      </style>
      
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
        backdropFilter: 'blur(4px)'
      }}>
        <div style={{
          position: 'relative',
          textAlign: 'center',
          color: 'white'
        }}>
          {/* Sparkle effects */}
          {isVisible && (
            <>
              <div className="sparkle" style={{
                position: 'absolute',
                top: '10%',
                left: '20%',
                width: '8px',
                height: '8px',
                background: rarityColors[rarity],
                '--delay': '0s'
              }} />
              <div className="sparkle" style={{
                position: 'absolute',
                top: '20%',
                right: '15%',
                width: '6px',
                height: '6px',
                background: rarityColors[rarity],
                '--delay': '0.5s'
              }} />
              <div className="sparkle" style={{
                position: 'absolute',
                bottom: '25%',
                left: '10%',
                width: '4px',
                height: '4px',
                background: rarityColors[rarity],
                '--delay': '1s'
              }} />
              <div className="sparkle" style={{
                position: 'absolute',
                bottom: '15%',
                right: '25%',
                width: '5px',
                height: '5px',
                background: rarityColors[rarity],
                '--delay': '1.5s'
              }} />
            </>
          )}
          
          {/* Main panel */}
          <div 
            className={`reveal-panel ${isVisible ? 'visible' : ''}`}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              border: `3px solid ${rarityColors[rarity]}`,
              borderRadius: '16px',
              padding: '32px',
              minWidth: '300px',
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* Header */}
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: rarityColors[rarity],
              textShadow: `0 0 10px ${rarityGlow[rarity]}`
            }}>
              🎉 Pet Hatched! 🎉
            </div>
            
            <div style={{
              fontSize: '18px',
              marginBottom: '24px',
              color: '#fff',
              opacity: 0.9
            }}>
              Your new companion awaits!
            </div>
            
            {/* Pet icon based on species */}
            <div style={{
              fontSize: '64px',
              marginBottom: '24px',
              filter: `drop-shadow(0 0 10px ${rarityGlow[rarity]})`
            }}>
              {species === 'fox' && '🦊'}
              {species === 'bunny' && '🐰'}
              {species === 'cat' && '🐱'}
              {!['fox', 'bunny', 'cat'].includes(species) && '🐾'}
            </div>
            
            {/* Stats reveal */}
            {showStats && (
              <>
                {/* Species */}
                <div className="stat-item" style={{
                  animationDelay: '0.1s',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '4px' }}>
                    SPECIES
                  </div>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold',
                    textTransform: 'capitalize',
                    color: '#fff'
                  }}>
                    {species}
                  </div>
                </div>
                
                {/* Element */}
                <div className="stat-item" style={{
                  animationDelay: '0.3s',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '4px' }}>
                    ELEMENT
                  </div>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold',
                    textTransform: 'capitalize',
                    color: elementColors[element] || '#fff',
                    textShadow: `0 0 8px ${elementColors[element] || '#fff'}44`
                  }}>
                    {element}
                  </div>
                </div>
                
                {/* Rarity */}
                <div className="stat-item" style={{
                  animationDelay: '0.5s',
                  marginBottom: '24px'
                }}>
                  <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '4px' }}>
                    RARITY
                  </div>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    color: rarityColors[rarity],
                    textShadow: `0 0 8px ${rarityGlow[rarity]}`
                  }}>
                    {rarity}
                    {rarity === 'legendary' && ' ✨'}
                    {rarity === 'epic' && ' 💜'}
                    {rarity === 'rare' && ' 💎'}
                    {rarity === 'common' && ' 🌟'}
                  </div>
                </div>
                
                {/* Special traits if any */}
                {traits.markings && traits.markings !== 'none' && (
                  <div className="stat-item" style={{
                    animationDelay: '0.7s',
                    marginBottom: '16px',
                    fontSize: '14px',
                    opacity: 0.8
                  }}>
                    Special trait: <span style={{ color: rarityColors[rarity] }}>
                      {traits.markings}
                    </span>
                  </div>
                )}
                
                {/* Continue button */}
                <div className="stat-item" style={{ animationDelay: '0.9s' }}>
                  <button
                    onClick={onDone}
                    style={{
                      background: `linear-gradient(135deg, ${rarityColors[rarity]} 0%, ${rarityColors[rarity]}dd 100%)`,
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: `0 4px 15px ${rarityGlow[rarity]}`,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)'
                      e.target.style.boxShadow = `0 6px 20px ${rarityGlow[rarity]}`
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = `0 4px 15px ${rarityGlow[rarity]}`
                    }}
                  >
                    Meet Your Pet! 🐾
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}