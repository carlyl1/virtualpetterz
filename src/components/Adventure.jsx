import React, { useEffect, useState } from 'react'

function generateMockAdventure(party) {
  const names = party.map((p) => p.name).join(', ')
  const seeds = [
    `In the pixel forest, ${names} find a glowing shard. Do they grasp it or leave it be?`,
    `${names} enter a neon cave where echoes speak. Do they follow the voice or mark a retreat?`,
    `${names} meet a robo-merchant offering a mystery chip. Trade tokens or haggle?`,
  ]
  return seeds[Math.floor(Math.random() * seeds.length)]
}

function incQuest(id) {
  try {
    const mod = require('../quests/manager')
    mod.incrementQuest?.(id, 1)
  } catch {}
}

export default function Adventure({ party = [], onExit, onReward }) {
  const [story, setStory] = useState('')
  const [choice, setChoice] = useState(null)
  const [cooldownSec, setCooldownSec] = useState(() => Number(localStorage.getItem('ct_adv_cooldown') || '0'))

  useEffect(() => {
    if (cooldownSec <= 0) return
    const id = setInterval(() => setCooldownSec((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [cooldownSec])

  useEffect(() => {
    localStorage.setItem('ct_adv_cooldown', String(Math.max(0, cooldownSec)))
  }, [cooldownSec])

  const startMission = () => {
    if (cooldownSec > 0) return
    setStory(generateMockAdventure(party))
    setChoice(null)
  }

  const resolveChoice = (c) => {
    setChoice(c)
    incQuest('adventure')
    const success = Math.random() > 0.5
    if (success) onReward?.(5)
    setCooldownSec(60)
  }

  return (
    <div className="battle-container">
      <h2>Adventure</h2>
      <div style={{ textAlign: 'left', fontSize: 10, color: '#ccc', background: '#111', padding: 10, borderRadius: 6 }}>
        {cooldownSec > 0 ? `A mysterious portal reopens in ${cooldownSec}s...` : (story || 'Generate a new mission to begin your quest.')}
      </div>
      <div style={{ marginTop: 12 }}>
        <button disabled={cooldownSec > 0} onClick={startMission}>Generate Mission</button>
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button disabled={!story || cooldownSec > 0} onClick={() => resolveChoice('A')}>Choice A</button>
        <button disabled={!story || cooldownSec > 0} onClick={() => resolveChoice('B')}>Choice B</button>
      </div>
      {choice && (
        <div className="battle-result" style={{ marginTop: 10 }}>
          Outcome decided! {`You chose ${choice}.`} {' '}
          <span>{'('}Reward on success: +5 tokens{')'}</span>
        </div>
      )}
      <div style={{ marginTop: 12 }}>
        <button onClick={onExit}>Back</button>
      </div>
    </div>
  )
}