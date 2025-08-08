import React, { useEffect, useState } from 'react'

function todayKey() {
  const d = new Date()
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`
}

export default function DailyCheckin({ onClaim, onClose }) {
  const [last, setLast] = useState(() => localStorage.getItem('ct_last_daily') || '')
  const [canClaim, setCanClaim] = useState(false)

  useEffect(() => {
    setCanClaim(last !== todayKey())
  }, [last])

  const claim = () => {
    if (!canClaim) return
    const nowKey = todayKey()
    localStorage.setItem('ct_last_daily', nowKey)
    setLast(nowKey)
    onClaim?.(5)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1a1a1a', border: '4px solid #00ff99', borderRadius: 12, padding: 16, width: 360, textAlign: 'center' }}>
        <h3 style={{ marginTop: 0, color: '#00ff99' }}>Daily Check-in</h3>
        <p style={{ fontSize: 12, color: '#b8ffe6' }}>Claim +5 tokens once per day.</p>
        <button disabled={!canClaim} onClick={claim}>
          {canClaim ? 'Claim +5' : 'Come back tomorrow'}
        </button>
        <div style={{ marginTop: 10 }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}