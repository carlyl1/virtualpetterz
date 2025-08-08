import React, { useEffect, useState } from 'react'

function calculateDamage(attacker, defender) {
  const baseDamage = attacker.attack - defender.defense
  return baseDamage > 0 ? baseDamage : 1
}

function recordWin() {
  try {
    const lb = JSON.parse(localStorage.getItem('ct_leaderboard') || '[]')
    const me = lb.find((e) => e.name === 'You') || { name: 'You', wins: 0, tokens: 0 }
    me.wins = (me.wins || 0) + 1
    const others = lb.filter((e) => e !== me)
    localStorage.setItem('ct_leaderboard', JSON.stringify([me, ...others]))
  } catch {}
}

function incQuest(id) {
  try {
    const mod = require('../quests/manager')
    mod.incrementQuest?.(id, 1)
  } catch {}
}

export default function Battle({ playerPet, opponentPet, onBattleEnd, onReward }) {
  const [playerStats, setPlayerStats] = useState({ ...playerPet.stats })
  const [opponentStats, setOpponentStats] = useState({ ...opponentPet.stats })
  const [battleLog, setBattleLog] = useState([])
  const [turn, setTurn] = useState('player')
  const [isBattleOver, setIsBattleOver] = useState(false)
  const [winner, setWinner] = useState(null)

  useEffect(() => {
    if (isBattleOver) return

    const timeout = setTimeout(() => {
      if (turn === 'player') {
        const damage = calculateDamage(playerStats, opponentStats)
        const newOpponentHp = Math.max(0, opponentStats.hp - damage)
        setOpponentStats((prev) => ({ ...prev, hp: newOpponentHp }))
        setBattleLog((log) => [...log, `Your pet hits opponent for ${damage} damage!`])
        if (newOpponentHp === 0) {
          setIsBattleOver(true)
          setWinner('player')
        } else {
          setTurn('opponent')
        }
      } else {
        const damage = calculateDamage(opponentStats, playerStats)
        const newPlayerHp = Math.max(0, playerStats.hp - damage)
        setPlayerStats((prev) => ({ ...prev, hp: newPlayerHp }))
        setBattleLog((log) => [...log, `Opponent hits your pet for ${damage} damage!`])
        if (newPlayerHp === 0) {
          setIsBattleOver(true)
          setWinner('opponent')
        } else {
          setTurn('player')
        }
      }
    }, 1200)

    return () => clearTimeout(timeout)
  }, [turn, isBattleOver, opponentStats, playerStats])

  const finish = () => {
    if (winner === 'player') {
      recordWin()
      incQuest('battle_win')
      onReward?.(3)
    }
    onBattleEnd(winner)
  }

  return (
    <div className="battle-container">
      <h2>Battle!</h2>
      <div className="stats-row">
        <div>
          <h3>Your Pet</h3>
          <p>HP: {playerStats.hp}</p>
          <p>Attack: {playerStats.attack}</p>
          <p>Defense: {playerStats.defense}</p>
          <p>Speed: {playerStats.speed}</p>
        </div>
        <div>
          <h3>Opponent Pet</h3>
          <p>HP: {opponentStats.hp}</p>
          <p>Attack: {opponentStats.attack}</p>
          <p>Defense: {opponentStats.defense}</p>
          <p>Speed: {opponentStats.speed}</p>
        </div>
      </div>
      <div className="battle-log">
        {battleLog.map((entry, idx) => (
          <p key={idx}>{entry}</p>
        ))}
      </div>
      {isBattleOver && (
        <div className="battle-result">
          <h3>{winner === 'player' ? 'You Win!' : 'You Lose!'}</h3>
          {winner === 'player' && <p>+3 tokens</p>}
          <button onClick={finish}>End Battle</button>
        </div>
      )}
    </div>
  )
}