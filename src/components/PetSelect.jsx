import React from 'react'

const PETS = [
  { id: 'forest-fox', name: 'Forest Fox', src: '/assets/pets/forest-fox.svg' },
  { id: 'mystic-bunny', name: 'Mystic Bunny', src: '/assets/pets/mystic-bunny.svg' },
  { id: 'robo-cat', name: 'Robo Cat', src: '/assets/pets/robo-cat.svg' },
]

export default function PetSelect({ onSelect }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: '#1a1a1a', border: '4px solid #00ff99', borderRadius: 12,
        padding: 16, width: 'min(92vw, 720px)', boxShadow: '0 0 12px #00ff99',
      }}>
        <h2 style={{ marginTop: 0, color: '#00ff99' }}>Choose Your Pet</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {PETS.map((pet) => (
            <button key={pet.id} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              onClick={() => {
                localStorage.setItem('ct_selected_pet', pet.id)
                onSelect(pet)
              }}>
              <div style={{ border: '3px solid #00ff99', borderRadius: 8, padding: 8, background: '#111' }}>
                <img src={pet.src} alt={pet.name} style={{ imageRendering: 'pixelated', width: 120, height: 120 }} />
                <div style={{ color: '#b8ffe6', marginTop: 6, fontSize: 12 }}>{pet.name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}