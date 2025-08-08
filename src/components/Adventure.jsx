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

async function loadAdventurePack(path = '/adventures/neon-portal.json') {
  try {
    const res = await fetch(path, { cache: 'no-store' })
    if (!res.ok) throw new Error('not ok')
    return await res.json()
  } catch {
    return null
  }
}

function applyEffects(effects, apply) {
  if (!effects) return
  if (typeof effects.hunger === 'number') apply('hunger', effects.hunger)
  if (typeof effects.happiness === 'number') apply('happiness', effects.happiness)
  if (typeof effects.tokens === 'number') apply('tokens', effects.tokens)
  if (typeof effects.xp === 'number') apply('xp', effects.xp)
}

export default function Adventure({ party = [], onExit, onReward, applyStat }) {
  const [story, setStory] = useState('')
  const [choice, setChoice] = useState(null)
  const [cooldownSec, setCooldownSec] = useState(() => Number(localStorage.getItem('ct_adv_cooldown') || '0'))
  const [pack, setPack] = useState(null)
  const [nodeId, setNodeId] = useState(null)

  useEffect(() => { (async () => setPack(await loadAdventurePack()))() }, [])

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
    if (pack) {
      setNodeId(pack.startId)
      setStory(resolveText(pack, pack.startId, party))
      setChoice(null)
    } else {
      setStory(generateMockAdventure(party))
      setChoice(null)
    }
  }

  const resolveText = (p, id, party) => {
    const node = p.nodes.find(n => n.id === id)
    if (!node) return '...'
    const petName = (party[0] && party[0].name) || 'your pet'
    return (node.text || '').replace('{pet}', petName)
  }

  const currentChoices = () => {
    if (!pack || !nodeId) return null
    const node = pack.nodes.find(n => n.id === nodeId)
    return node?.choices || []
  }

  const pick = (c) => {
    setChoice(c)
    if (pack && nodeId) {
      const node = pack.nodes.find(n => n.id === nodeId)
      const ch = (node?.choices || []).find(x => x.id === c)
      if (ch) {
        applyEffects(ch.effects, (stat, delta) => applyStat && applyStat(stat, delta))
        if (ch.nextId) {
          setNodeId(ch.nextId)
          setStory(resolveText(pack, ch.nextId, party))
          setChoice(null)
          return
        }
      }
      setCooldownSec(60)
      onReward && onReward(5)
    } else {
      setCooldownSec(60)
      onReward && onReward(5)
    }
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
      <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {currentChoices() ? currentChoices().map(ch => (
          <button key={ch.id} disabled={cooldownSec > 0} onClick={() => pick(ch.id)}>{ch.label}</button>
        )) : (
          <>
            <button disabled={!story || cooldownSec > 0} onClick={() => pick('A')}>Choice A</button>
            <button disabled={!story || cooldownSec > 0} onClick={() => pick('B')}>Choice B</button>
          </>
        )}
      </div>
      {choice && (
        <div className="battle-result" style={{ marginTop: 10 }}>
          Outcome decided! You chose: {choice}. (Reward on success: +5 tokens)
        </div>
      )}
      <div style={{ marginTop: 12 }}>
        <button onClick={onExit}>Back</button>
      </div>
    </div>
  )
}