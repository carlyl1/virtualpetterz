import React from 'react'
import PetPreview from './PetPreview'

const PETS = [
  { id: 'forest-fox', name: 'Forest Fox', src: '/assets/sprites/forest_fox__idle.png', fallback: '/assets/pets/forest-fox.svg' },
  { id: 'mystic-bunny', name: 'Mystic Bunny', src: '/assets/sprites/mystic_bunny__idle.png', fallback: '/assets/pets/mystic-bunny.svg' },
  { id: 'robo-cat', name: 'Robo Cat', src: '/assets/sprites/robo_cat__idle.png', fallback: '/assets/pets/robo-cat.svg' },
  { id: 'water-duck', name: 'Water Duck', src: '/assets/sprites/water_duck__idle.png' },
  { id: 'shadow-wolf', name: 'Shadow Wolf', src: '/assets/sprites/shadow_wolf__idle.png' },
  { id: 'pixel-sloth', name: 'Pixel Sloth', src: '/assets/sprites/pixel_sloth__idle.png' },
  { id: 'chonk-hamster', name: 'Chonk Hamster', src: '/assets/sprites/chonk_hamster__idle.png' },
  { id: 'glitch-moth', name: 'Glitch Moth', src: '/assets/sprites/glitch_moth__idle.png' },
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, maxHeight: '70vh', overflowY: 'auto' }}>
          {PETS.map((pet) => (
            <button 
              key={pet.id} 
              style={{ 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => {
                localStorage.setItem('ct_selected_pet', pet.id)
                onSelect(pet)
              }}
              onMouseEnter={(e) => {
                e.currentTarget.querySelector('div').style.borderColor = '#00ffcc'
                e.currentTarget.querySelector('div').style.transform = 'scale(1.05)'
                e.currentTarget.querySelector('div').style.boxShadow = '0 0 15px rgba(0, 255, 204, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.querySelector('div').style.borderColor = '#00ff99'
                e.currentTarget.querySelector('div').style.transform = 'scale(1)'
                e.currentTarget.querySelector('div').style.boxShadow = 'none'
              }}>
              <div style={{ 
                border: '3px solid #00ff99', 
                borderRadius: 8, 
                padding: 8, 
                background: '#111',
                transition: 'all 0.2s ease'
              }}>
                <PetPreview petType={pet.id} size={96} />
                <div style={{ color: '#b8ffe6', marginTop: 6, fontSize: 11, fontWeight: 'bold' }}>{pet.name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}