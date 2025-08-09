import React, { useMemo, useState } from 'react'
import unifiedProgression from '../systems/UnifiedProgression'

const ITEMS = [
  { id: 'food', name: 'Food 🍗', price: 5, effect: { hunger: +20 } },
  { id: 'toy', name: 'Toy 🎲', price: 7, effect: { happiness: +20 } },
]

export default function Shop({ onClose, onUseItem, refreshGameData }) {
  const [gameData, setGameData] = useState(() => unifiedProgression.getAllData())
  const [purchaseStatus, setPurchaseStatus] = useState(null)

  const refreshData = () => {
    const newData = unifiedProgression.getAllData()
    setGameData(newData)
    refreshGameData?.() // Notify parent to refresh
  }

  const addItem = async (id) => {
    const item = ITEMS.find((i) => i.id === id)
    if (!item) return
    
    setPurchaseStatus('processing')
    
    try {
      // Use unified progression system for token spending validation
      const currentData = unifiedProgression.getAllData()
      if (currentData.playerStats.tokens < item.price) {
        setPurchaseStatus('insufficient_funds')
        setTimeout(() => setPurchaseStatus(null), 2000)
        return
      }

      // Process purchase through unified system
      const success = unifiedProgression.spendTokens(item.price)
      if (success) {
        // Add item to inventory
        const currentInventory = JSON.parse(localStorage.getItem('ct_inventory') || '{}')
        const newInventory = { ...currentInventory, [id]: (currentInventory[id] || 0) + 1 }
        localStorage.setItem('ct_inventory', JSON.stringify(newInventory))
        
        setPurchaseStatus('success')
        refreshData()
        
        // Auto-hide success message
        setTimeout(() => setPurchaseStatus(null), 1500)
      } else {
        setPurchaseStatus('failed')
        setTimeout(() => setPurchaseStatus(null), 2000)
      }
    } catch (error) {
      console.error('Purchase failed:', error)
      setPurchaseStatus('error')
      setTimeout(() => setPurchaseStatus(null), 2000)
    }
  }

  const useItem = (id) => {
    const currentInventory = JSON.parse(localStorage.getItem('ct_inventory') || '{}')
    if (!currentInventory[id] || currentInventory[id] <= 0) return
    
    const nextInv = { ...currentInventory, [id]: currentInventory[id] - 1 }
    localStorage.setItem('ct_inventory', JSON.stringify(nextInv))
    onUseItem(id)
    
    // Update local state to reflect change immediately
    refreshData()
  }

  const getStatusMessage = () => {
    switch (purchaseStatus) {
      case 'processing': return { text: 'Processing purchase...', color: '#ffcc00' }
      case 'success': return { text: '✅ Purchase successful!', color: '#00ff99' }
      case 'insufficient_funds': return { text: '❌ Not enough tokens', color: '#ff4444' }
      case 'failed': return { text: '❌ Purchase failed', color: '#ff4444' }
      case 'error': return { text: '❌ Transaction error', color: '#ff4444' }
      default: return null
    }
  }

  const currentInventory = JSON.parse(localStorage.getItem('ct_inventory') || '{}')

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1a1a1a', border: '4px solid #00ff99', borderRadius: 12, padding: 16, width: 'min(92vw, 720px)' }}>
        <h2 style={{ marginTop: 0, color: '#00ff99' }}>Shop & Inventory</h2>
        <div style={{ fontSize: 12, color: '#b8ffe6', marginBottom: 8 }}>
          Tokens: {gameData.playerStats.tokens} 
          <span style={{ marginLeft: '8px', fontSize: '10px', opacity: 0.7 }}>
            (Validated Balance)
          </span>
        </div>
        {getStatusMessage() && (
          <div style={{ 
            fontSize: 12, 
            color: getStatusMessage().color, 
            marginBottom: 8,
            padding: '4px 8px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            {getStatusMessage().text}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {ITEMS.map((it) => (
            <div key={it.id} style={{ border: '3px solid #00ff99', borderRadius: 8, padding: 10, background: '#111' }}>
              <div style={{ color: '#b8ffe6', marginBottom: 8 }}>{it.name}</div>
              <div style={{ fontSize: 12, marginBottom: 8 }}>Price: {it.price}</div>
              <button 
                onClick={() => addItem(it.id)}
                disabled={purchaseStatus === 'processing' || gameData.playerStats.tokens < it.price}
                style={{ 
                  opacity: purchaseStatus === 'processing' || gameData.playerStats.tokens < it.price ? 0.5 : 1,
                  cursor: purchaseStatus === 'processing' || gameData.playerStats.tokens < it.price ? 'not-allowed' : 'pointer'
                }}
              >
                {purchaseStatus === 'processing' ? 'Processing...' : 'Buy'}
              </button>
              <button 
                style={{ marginLeft: 8 }} 
                onClick={() => useItem(it.id)}
                disabled={!currentInventory[it.id] || currentInventory[it.id] <= 0}
              >
                Use ({currentInventory[it.id] || 0})
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