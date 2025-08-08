import React, { useEffect, useState } from 'react'

export default function Status() {
  const [health, setHealth] = useState(null)
  const [chatOk, setChatOk] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/.netlify/functions/health').then(r => r.json()).then(setHealth).catch(() => setHealth({ ok: false }))
    fetch('/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input: 'hello' }) })
      .then(r => setChatOk(r.ok)).catch(() => setChatOk(false))
      .catch(e => setErr(String(e)))
  }, [])

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 16 }}>
      <h2>Status</h2>
      <p>Health: {health ? (health.ok ? 'OK' : 'Fail') : '…'}</p>
      <p>Chat proxy reachable: {chatOk == null ? '…' : chatOk ? 'OK' : 'Fail'}</p>
      {err && <pre>{err}</pre>}
    </div>
  )
}