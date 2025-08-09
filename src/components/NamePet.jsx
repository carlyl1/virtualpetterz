import React, { useState } from 'react'
import { savePet } from '../api/client'

export default function NamePet({ wallet, onDone }) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    const trimmed = name.trim().slice(0, 24)
    if (!trimmed) { setError('Please enter a name'); return }
    setSaving(true)
    try {
      if (wallet) await savePet(wallet, { state: { name: trimmed } })
      else localStorage.setItem('ct_pet_name', trimmed)
      onDone?.(trimmed)
    } catch (e) {
      setError('Could not save. Try again?')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100 }}>
      <div style={{ background: '#111', border: '3px solid #00ff99', borderRadius: 8, padding: 16, width: 'min(92vw, 520px)', color: '#b8ffe6' }}>
        <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#00ff99' }}>Name your pet</div>
        <div style={{ fontSize: 12, marginBottom: 8 }}>Give your new friend a name. You can change this later.</div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Pixel Pup" style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '2px solid #00ff99', background: '#070707', color: '#eafff6' }} />
        {error && <div style={{ color: '#ff8aa0', fontSize: 11, marginTop: 6 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={submit} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}