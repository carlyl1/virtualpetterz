import React, { useMemo } from 'react'
import { generatePet } from '../generators/petGenerator'
import PetSprite from './PetSprite'

export default function PetPreview({ petType, size = 96, onClick }) {
  // Generate unique pet data for each type with enhanced variety
  const petData = useMemo(() => {
    const petSeeds = {
      'forest-fox': 'fox-seed-001',
      'mystic-bunny': 'bunny-seed-002', 
      'robo-cat': 'cat-seed-003',
      'water-duck': 'duck-seed-004',
      'shadow-wolf': 'wolf-seed-005',
      'pixel-sloth': 'sloth-seed-006',
      'chonk-hamster': 'hamster-seed-007',
      'glitch-moth': 'moth-seed-008'
    }
    
    const basePet = generatePet(petSeeds[petType] || petType)
    
    // Type-specific characteristics for visual variety
    const typeOverrides = {
      'forest-fox': {
        species: 'Forest Fox',
        happiness: 75,
        hunger: 60,
        rarity: 'rare'
      },
      'mystic-bunny': {
        species: 'Mystic Bunny',
        happiness: 90,
        hunger: 70,
        rarity: 'epic'
      },
      'robo-cat': {
        species: 'Robo Cat',
        happiness: 65,
        hunger: 80,
        rarity: 'rare'
      },
      'water-duck': {
        species: 'Water Duck',
        happiness: 80,
        hunger: 65,
        rarity: 'common'
      },
      'shadow-wolf': {
        species: 'Shadow Wolf',
        happiness: 60,
        hunger: 85,
        rarity: 'legendary'
      },
      'pixel-sloth': {
        species: 'Pixel Sloth',
        happiness: 95,
        hunger: 40,
        rarity: 'common',
        sleeping: true
      },
      'chonk-hamster': {
        species: 'Chonk Hamster',
        happiness: 85,
        hunger: 30,
        rarity: 'rare'
      },
      'glitch-moth': {
        species: 'Glitch Moth',
        happiness: 70,
        hunger: 90,
        rarity: 'legendary'
      }
    }
    
    return { ...basePet, ...typeOverrides[petType] }
  }, [petType])

  return (
    <div 
      className="pet-preview-container"
      onClick={onClick}
      style={{
        width: size + 'px',
        height: size + 'px',
        border: '2px solid rgba(0, 255, 153, 0.3)',
        borderRadius: '8px',
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        backdropFilter: 'blur(2px)',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = 'rgba(0, 255, 153, 0.8)'
          e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 153, 0.4)'
          e.currentTarget.style.transform = 'scale(1.05)'
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = 'rgba(0, 255, 153, 0.3)'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.transform = 'scale(1)'
        }
      }}
    >
      <PetSprite
        petSpecies={petType}
        happiness={petData.happiness}
        hunger={petData.hunger}
        sleeping={petData.sleeping}
        inBattle={false}
        rarity={petData.rarity}
        width={size * 0.8}
        height={size * 0.8}
        showEffects={true}
        enableLayering={true}
        animate={!petData.sleeping}
        style={{
          filter: petData.sleeping ? 'brightness(0.8)' : 'brightness(1)'
        }}
      />
      
      {/* Species name overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '4px',
          left: '4px',
          right: '4px',
          fontSize: '8px',
          color: '#00ff99',
          textAlign: 'center',
          background: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '2px',
          padding: '2px',
          fontFamily: 'monospace'
        }}
      >
        {petData.species}
      </div>
      
      {/* Rarity indicator */}
      <div
        style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          fontSize: '6px',
          fontWeight: 'bold',
          color: petData.rarity === 'legendary' ? '#FFD700' :
                 petData.rarity === 'epic' ? '#8B5CF6' :
                 petData.rarity === 'rare' ? '#3B82F6' : '#9CA3AF',
          textTransform: 'uppercase',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '1px 3px',
          borderRadius: '2px',
          fontFamily: 'monospace'
        }}
      >
        {petData.rarity}
      </div>
    </div>
  )
}