import React, { useEffect, useState } from 'react'
import { getQuests, claimQuest } from '../quests/manager'

function ProgressBar({ value, max }) {
  const pct = Math.min(1, value / max)
  return (
    <div style={{ height: 10, border: '2px solid #00ff99', borderRadius: 6, background: '#101a16' }}>
      <div style={{ height: '100%', width: `${pct * 100}%`, background: 'linear-gradient(90deg, #00ff99, #00cc77)' }} />
    </div>
  )
}

export default function Quests({ onClose, onReward }) {
  const [quests, setQuests] = useState(getQuests())

  useEffect(() => {
    setQuests(getQuests())
  }, [])

  const claim = (id) => {
    const res = claimQuest(id)
    setQuests(res.quests)
    if (res.ok) onReward?.(res.reward)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1a1a1a', border: '4px solid #00ff99', borderRadius: 12, padding: 16, width: 'min(92vw, 560px)' }}>
        <h2 style={{ marginTop: 0, color: '#00ff99' }}>Quests</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {quests.map((q) => (
            <div key={q.id} style={{ border: '3px solid #00ff99', borderRadius: 8, padding: 10, background: '#111' }}>
              <div style={{ color: '#b8ffe6', marginBottom: 6, fontSize: 12 }}>{q.title} (Reward: +{q.reward})</div>
              <ProgressBar value={q.progress || 0} max={q.target} />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: '#b8ffe6' }}>{q.progress || 0}/{q.target}</div>
                <button disabled={q.claimed || (q.progress || 0) < q.target} onClick={() => claim(q.id)}>
                  {q.claimed ? 'Claimed' : 'Claim'}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}