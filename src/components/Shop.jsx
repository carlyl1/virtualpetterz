import React, { useMemo, useState } from 'react'

const ITEMS = [
  { id: 'food', name: 'Food 🍗', price: 5, effect: { hunger: +20 } },
  { id: 'toy', name: 'Toy 🎲', price: 7, effect: { happiness: +20 } },
]

export default function Shop({ onClose, onUseItem }) {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ct_tokens') || '25'))
  const [inventory, setInventory] = useState(() => JSON.parse(localStorage.getItem('ct_inventory') || '{}'))

  const addItem = (id) => {
    const item = ITEMS.find((i) => i.id === id)
    if (!item) return
    if (balance < item.price) return alert('Not enough tokens')
    const nextBal = balance - item.price
    const nextInv = { ...inventory, [id]: (inventory[id] || 0) + 1 }
    setBalance(nextBal)
    setInventory(nextInv)
    localStorage.setItem('ct_tokens', String(nextBal))
    localStorage.setItem('ct_inventory', JSON.stringify(nextInv))
  }

  const useItem = (id) => {
    if (!inventory[id]) return
    const nextInv = { ...inventory, [id]: inventory[id] - 1 }
    setInventory(nextInv)
    localStorage.setItem('ct_inventory', JSON.stringify(nextInv))
    onUseItem(id)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1a1a1a', border: '4px solid #00ff99', borderRadius: 12, padding: 16, width: 'min(92vw, 720px)' }}>
        <h2 style={{ marginTop: 0, color: '#00ff99' }}>Shop & Inventory</h2>
        <div style={{ fontSize: 12, color: '#b8ffe6', marginBottom: 8 }}>Tokens: {balance}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {ITEMS.map((it) => (
            <div key={it.id} style={{ border: '3px solid #00ff99', borderRadius: 8, padding: 10, background: '#111' }}>
              <div style={{ color: '#b8ffe6', marginBottom: 8 }}>{it.name}</div>
              <div style={{ fontSize: 12, marginBottom: 8 }}>Price: {it.price}</div>
              <button onClick={() => addItem(it.id)}>Buy</button>
              <button style={{ marginLeft: 8 }} onClick={() => useItem(it.id)}>
                Use ({inventory[it.id] || 0})
              </button>
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