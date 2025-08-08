import React, { useEffect, useMemo, useState } from 'react'
import { createGroupAdventure, joinGroupAdventure, voteGroupAdventure } from '../api/client'

async function loadAdventurePack(path = '/adventures/neon-portal.json') {
  try {
    const res = await fetch(path, { cache: 'no-store' })
    if (!res.ok) throw new Error('not ok')
    return await res.json()
  } catch {
    return null
  }
}

function resolveNode(pack, id) {
  return pack?.nodes?.find((n) => n.id === id) || null
}

export default function GroupAdventure({ walletPubkey, onExit }) {
  const [pack, setPack] = useState(null)
  const [room, setRoom] = useState(null)
  const [roomIdInput, setRoomIdInput] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => { (async () => setPack(await loadAdventurePack()))() }, [])

  useEffect(() => {
    if (!room?.id) return
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/.netlify/functions/group-adventure?roomId=${room.id}`)
        if (res.ok) setRoom(await res.json())
      } catch {}
    }, 2000)
    return () => clearInterval(id)
  }, [room?.id])

  const node = useMemo(() => (room && pack ? resolveNode(pack, room.nodeId) : null), [room, pack])
  const choices = node?.choices || []

  const myWallet = walletPubkey || 'guest'

  const createRoom = async () => {
    setStatus('Creating...')
    try {
      const r = await createGroupAdventure('neon-portal')
      setRoom(r)
      setStatus('Room created. Share the ID with friends!')
    } catch (e) {
      setStatus('Failed to create room')
    }
  }

  const joinRoom = async () => {
    if (!roomIdInput) return
    setStatus('Joining...')
    try {
      const r = await joinGroupAdventure(roomIdInput, myWallet)
      setRoom(r)
      setStatus('Joined room')
    } catch {
      setStatus('Failed to join')
    }
  }

  const vote = async (choice) => {
    if (!room) return
    setStatus('Voting...')
    try {
      const r = await voteGroupAdventure(room.id, myWallet, choice.id, choice.nextId)
      setRoom(r)
      setStatus('Vote recorded')
    } catch {
      setStatus('Vote failed')
    }
  }

  return (
    <div className="battle-container">
      <h2>Group Adventure</h2>
      {!room && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={createRoom}>Create Room</button>
          <input value={roomIdInput} onChange={(e) => setRoomIdInput(e.target.value)} placeholder="Enter Room ID" style={{ width: 160 }} />
          <button onClick={joinRoom}>Join</button>
        </div>
      )}
      {room && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, color: '#9cf' }}>Room ID: {room.id} · Node: {room.nodeId} · Members: {room.members?.length || 0}</div>
          <div style={{ marginTop: 8, background: '#111', padding: 10, borderRadius: 6 }}>
            {(node?.text || 'Waiting...').replace('{pet}', 'your party')}
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {choices.map((c) => (
              <button key={c.id} onClick={() => vote(c)}>{c.label}</button>
            ))}
          </div>
        </div>
      )}
      {status && <div className="battle-result" style={{ marginTop: 8 }}>{status}</div>}
      <div style={{ marginTop: 12 }}>
        <button onClick={onExit}>Back</button>
      </div>
    </div>
  )
}