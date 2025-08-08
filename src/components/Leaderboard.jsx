import React, { useEffect, useState } from 'react'

export default function Leaderboard({ onClose }) {
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ct_leaderboard') || '[]') } catch { return [] }
  })

  useEffect(() => {
    // keep sorted by tokens desc
    const sorted = [...entries].sort((a, b) => (b.tokens || 0) - (a.tokens || 0))
    setEntries(sorted)
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1a1a1a', border: '4px solid #00ff99', borderRadius: 12, padding: 16, width: 'min(92vw, 560px)' }}>
        <h2 style={{ marginTop: 0, color: '#00ff99' }}>Leaderboard (Local)</h2>
        <table style={{ width: '100%', fontSize: 12, color: '#b8ffe6' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Name</th>
              <th>Wins</th>
              <th>Tokens</th>
            </tr>
          </thead>
          <tbody>
            {entries.slice(0, 10).map((e, i) => (
              <tr key={i}>
                <td>{e.name || 'You'}</td>
                <td style={{ textAlign: 'center' }}>{e.wins || 0}</td>
                <td style={{ textAlign: 'center' }}>{e.tokens || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 12 }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}