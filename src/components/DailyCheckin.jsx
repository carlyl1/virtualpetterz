import React, { useEffect, useState } from 'react'
import unifiedProgression from '../systems/UnifiedProgression'

function todayKey() {
  const d = new Date()
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`
}

export default function DailyCheckin({ onClaim, onClose }) {
  const [canClaim, setCanClaim] = useState(false)
  const [claimStatus, setClaimStatus] = useState(null)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    // Use unified progression system for daily login tracking
    const dailyResult = unifiedProgression.checkDailyLogin()
    setCanClaim(!dailyResult.alreadyClaimed)
    setStreak(dailyResult.streak || 0)
  }, [])

  const claim = async () => {
    if (!canClaim) return
    
    setClaimStatus('claiming')
    
    try {
      // Use unified progression system for validated daily rewards
      const dailyResult = unifiedProgression.checkDailyLogin()
      
      if (dailyResult.alreadyClaimed) {
        setClaimStatus('already_claimed')
        setCanClaim(false)
        setTimeout(() => setClaimStatus(null), 2000)
        return
      }
      
      // Process daily claim through unified system
      const baseReward = 5
      const streakBonus = Math.min(dailyResult.streak - 1, 10) // Max +10 bonus
      const totalReward = baseReward + streakBonus
      
      unifiedProgression.addTokens(totalReward)
      
      setClaimStatus('success')
      setCanClaim(false)
      setStreak(dailyResult.streak)
      
      // Notify parent
      onClaim?.(totalReward)
      
      // Auto-close after showing success
      setTimeout(() => {
        setClaimStatus(null)
        onClose?.()
      }, 2000)
      
    } catch (error) {
      console.error('Daily claim failed:', error)
      setClaimStatus('error')
      setTimeout(() => setClaimStatus(null), 2000)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1a1a1a', border: '4px solid #00ff99', borderRadius: 12, padding: 16, width: 400, textAlign: 'center' }}>
        <h3 style={{ marginTop: 0, color: '#00ff99' }}>Daily Check-in</h3>
        <p style={{ fontSize: 12, color: '#b8ffe6', marginBottom: 8 }}>
          Daily rewards with streak bonuses!
        </p>
        
        {streak > 0 && (
          <div style={{ 
            fontSize: 11, 
            color: '#ffaa00', 
            marginBottom: 12,
            padding: '4px 8px',
            background: 'rgba(255, 170, 0, 0.1)',
            borderRadius: '4px',
            border: '1px solid rgba(255, 170, 0, 0.3)'
          }}>
            🔥 {streak} day streak! +{Math.min(streak - 1, 10)} bonus tokens
          </div>
        )}
        
        {claimStatus && (
          <div style={{ 
            fontSize: 11, 
            marginBottom: 12,
            padding: '6px 12px',
            borderRadius: '4px',
            color: claimStatus === 'success' ? '#00ff99' : claimStatus === 'error' ? '#ff4444' : claimStatus === 'already_claimed' ? '#ffaa00' : '#ccc',
            background: 'rgba(255,255,255,0.1)'
          }}>
            {claimStatus === 'claiming' && '⏳ Processing claim...'}
            {claimStatus === 'success' && '✅ Daily reward claimed!'}
            {claimStatus === 'already_claimed' && '❌ Already claimed today!'}
            {claimStatus === 'error' && '⚠️ Claim failed, try again'}
          </div>
        )}
        
        <button 
          disabled={!canClaim || claimStatus === 'claiming'} 
          onClick={claim}
          style={{
            opacity: !canClaim || claimStatus === 'claiming' ? 0.5 : 1,
            cursor: !canClaim || claimStatus === 'claiming' ? 'not-allowed' : 'pointer'
          }}
        >
          {claimStatus === 'claiming' ? 'Processing...' : 
           canClaim ? `Claim +${5 + Math.min(streak - 1, 10)}` : 
           'Come back tomorrow'}
        </button>
        <div style={{ marginTop: 10 }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}