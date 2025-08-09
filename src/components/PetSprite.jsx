import React, { useState, useEffect, useRef } from 'react';

const SPRITE_STATES = {
  IDLE: 'idle',
  HAPPY: 'happy', 
  HUNGRY: 'hungry',
  SLEEPY: 'sleepy',
  BATTLE: 'battle',
  LEGENDARY_IDLE: 'legendary_idle'
};

const PET_SPECIES_MAP = {
  'forest-fox': 'forest_fox',
  'mystic-bunny': 'mystic_bunny', 
  'robo-cat': 'robo_cat',
  'water-duck': 'water_duck',
  'shadow-wolf': 'shadow_wolf',
  'pixel-sloth': 'pixel_sloth',
  'chonk-hamster': 'chonk_hamster',
  'glitch-moth': 'glitch_moth'
};

function getSpritePath(petSpecies, state) {
  const speciesName = PET_SPECIES_MAP[petSpecies] || 'forest_fox';
  return `/assets/sprites/${speciesName}__${state}.png`;
}

function getSpriteStateFromProps(happiness, hunger, inBattle, sleeping, rarity) {
  if (inBattle) return SPRITE_STATES.BATTLE;
  if (sleeping) return SPRITE_STATES.SLEEPY;
  if (rarity === 'legendary' || rarity === 'epic') return SPRITE_STATES.LEGENDARY_IDLE;
  if (hunger < 30) return SPRITE_STATES.HUNGRY;
  if (happiness > 80) return SPRITE_STATES.HAPPY;
  return SPRITE_STATES.IDLE;
}

function PetSpriteLayer({ 
  petSpecies, 
  state, 
  width = 128, 
  height = 128, 
  className = '',
  style = {},
  animate = true,
  onError,
  onLoad
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef();

  const spritePath = getSpritePath(petSpecies, state);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [spritePath]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    if (onLoad) onLoad();
  };

  const handleImageError = () => {
    setImageError(true);
    if (onError) onError();
  };

  return (
    <img
      ref={imgRef}
      src={spritePath}
      alt={`${petSpecies} ${state}`}
      width={width}
      height={height}
      className={`pet-sprite-layer ${className} ${animate ? 'animate' : ''} ${imageLoaded ? 'loaded' : ''}`}
      style={{
        imageRendering: 'pixelated',
        ...style,
        opacity: imageLoaded ? (style.opacity || 1) : 0,
        transition: 'opacity 0.3s ease'
      }}
      onLoad={handleImageLoad}
      onError={handleImageError}
    />
  );
}

export default function PetSprite({ 
  petId, 
  petSpecies,
  happiness = 50, 
  hunger = 50,
  sleeping = false,
  inBattle = false,
  rarity = 'common',
  width = 128, 
  height = 128,
  className = '',
  style = {},
  actionSignal = null,
  showEffects = true,
  enableLayering = true
}) {
  const [currentState, setCurrentState] = useState(SPRITE_STATES.IDLE);
  const [previousState, setPreviousState] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [layerEffects, setLayerEffects] = useState([]);
  const [spriteLoadError, setSpriteLoadError] = useState(false);

  // Determine sprite state from props
  useEffect(() => {
    const newState = getSpriteStateFromProps(happiness, hunger, inBattle, sleeping, rarity);
    if (newState !== currentState) {
      setPreviousState(currentState);
      setCurrentState(newState);
      setIsTransitioning(true);
      
      setTimeout(() => {
        setIsTransitioning(false);
        setPreviousState(null);
      }, 300);
    }
  }, [happiness, hunger, inBattle, sleeping, rarity]);

  // Handle action signals for temporary state changes
  useEffect(() => {
    if (actionSignal) {
      if (actionSignal.type === 'eat') {
        setCurrentState(SPRITE_STATES.HAPPY);
        setTimeout(() => {
          setCurrentState(getSpriteStateFromProps(happiness, hunger, inBattle, sleeping, rarity));
        }, 2000);
      } else if (actionSignal.type === 'play') {
        setCurrentState(SPRITE_STATES.HAPPY);
        setTimeout(() => {
          setCurrentState(getSpriteStateFromProps(happiness, hunger, inBattle, sleeping, rarity));
        }, 2000);
      }
    }
  }, [actionSignal]);

  // Add visual effects based on state
  useEffect(() => {
    if (!showEffects) return;
    
    const effects = [];
    
    if (currentState === SPRITE_STATES.HAPPY) {
      effects.push({ type: 'sparkles', intensity: 'high' });
    } else if (currentState === SPRITE_STATES.LEGENDARY_IDLE) {
      effects.push({ type: 'glow', intensity: 'medium', color: '#FFD700' });
    } else if (currentState === SPRITE_STATES.BATTLE) {
      effects.push({ type: 'glow', intensity: 'high', color: '#FF4444' });
    } else if (currentState === SPRITE_STATES.HUNGRY) {
      effects.push({ type: 'pulse', intensity: 'low', color: '#FFA500' });
    }
    
    setLayerEffects(effects);
  }, [currentState, showEffects]);

  const handleSpriteError = () => {
    setSpriteLoadError(true);
  };

  const handleSpriteLoad = () => {
    setSpriteLoadError(false);
  };

  // Fallback to canvas rendering if sprite fails to load
  if (spriteLoadError) {
    return (
      <div 
        className={`pet-sprite-fallback ${className}`}
        style={{
          width: width + 'px',
          height: height + 'px',
          background: 'linear-gradient(45deg, #2a2a2a, #1a1a1a)',
          border: '2px solid rgba(0, 255, 153, 0.5)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#00ff99',
          fontFamily: 'monospace',
          ...style
        }}
      >
        {petSpecies?.toUpperCase() || 'PET'}
      </div>
    );
  }

  return (
    <div 
      className={`pet-sprite-container ${className}`}
      style={{
        position: 'relative',
        width: width + 'px',
        height: height + 'px',
        ...style
      }}
    >
      {/* Main sprite layer */}
      <PetSpriteLayer
        petSpecies={petSpecies || petId}
        state={currentState}
        width={width}
        height={height}
        className="main-sprite"
        onError={handleSpriteError}
        onLoad={handleSpriteLoad}
      />
      
      {/* Transition layer for smooth state changes */}
      {isTransitioning && previousState && enableLayering && (
        <PetSpriteLayer
          petSpecies={petSpecies || petId}
          state={previousState}
          width={width}
          height={height}
          className="transition-sprite"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: 0.3
          }}
          animate={false}
        />
      )}
      
      {/* Effect layers */}
      {enableLayering && layerEffects.map((effect, index) => (
        <div
          key={index}
          className={`sprite-effect sprite-effect-${effect.type}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10 + index,
            ...(effect.type === 'glow' && {
              boxShadow: `0 0 ${effect.intensity === 'high' ? '20px' : '10px'} ${effect.color}`,
              borderRadius: '50%',
              filter: 'blur(1px)'
            }),
            ...(effect.type === 'pulse' && {
              background: `radial-gradient(circle, ${effect.color}22 0%, transparent 70%)`,
              animation: 'spritePulse 2s infinite ease-in-out'
            })
          }}
        >
          {effect.type === 'sparkles' && (
            <>
              <div className="sparkle sparkle-1" />
              <div className="sparkle sparkle-2" />
              <div className="sparkle sparkle-3" />
            </>
          )}
        </div>
      ))}
      
      {/* State indicator */}
      <div className="sprite-state-indicator">
        <div className={`state-dot state-${currentState}`} />
      </div>
    </div>
  );
}