import React, { useState, useRef, useEffect } from 'react';
import { generatePet, renderPetCanvas } from '../generators/petGenerator';
import GroupExpedition from './GroupExpedition';
import SocialBattleSystem from './SocialBattleSystem';
import { ModularTileSystem } from '../systems/ModularTileSystem';

const TILES = {
  grass: '#2d5a2d',
  dirt: '#8B4513', 
  water: '#1E90FF',
  stone: '#696969',
  sand: '#F4A460',
  tree: '#006400',
  bush: '#228B22',
  flower: '#FF69B4',
  fence: '#8B4513',
  bench: '#A0522D',
  lamp: '#FFD700',
  portal: '#9370DB',
  chest: '#DAA520'
};

const GARDEN_LAYOUTS = {
  starter: [
    ['grass', 'grass', 'tree', 'grass', 'grass', 'grass', 'tree', 'grass'],
    ['grass', 'flower', 'grass', 'grass', 'bench', 'grass', 'grass', 'grass'],
    ['dirt', 'grass', 'grass', 'water', 'water', 'grass', 'bush', 'grass'],
    ['dirt', 'grass', 'grass', 'water', 'water', 'grass', 'grass', 'flower'],
    ['stone', 'stone', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass'],
    ['grass', 'grass', 'grass', 'fence', 'fence', 'grass', 'lamp', 'grass']
  ],
  adventure: [
    ['tree', 'tree', 'grass', 'portal', 'grass', 'tree', 'tree', 'tree'],
    ['tree', 'bush', 'grass', 'grass', 'grass', 'bush', 'tree', 'chest'],
    ['grass', 'grass', 'stone', 'stone', 'stone', 'grass', 'grass', 'grass'],
    ['water', 'water', 'stone', 'lamp', 'stone', 'grass', 'flower', 'grass'],
    ['water', 'water', 'stone', 'stone', 'stone', 'grass', 'grass', 'grass'],
    ['sand', 'sand', 'grass', 'bench', 'grass', 'grass', 'dirt', 'dirt']
  ]
};

export default function PetGarden({ gardenId = 'starter', walletConnected = false }) {
  const canvasRef = useRef();
  const [gardenPets, setGardenPets] = useState([]);
  const [selectedPets, setSelectedPets] = useState(new Set());
  const [showExpeditionForm, setShowExpeditionForm] = useState(false);
  const [showExpedition, setShowExpedition] = useState(false);
  const [expeditionParty, setExpeditionParty] = useState([]);
  const [showBattle, setShowBattle] = useState(false);
  const [battleOpponent, setBattleOpponent] = useState(null);
  const [gardenLayout, setGardenLayout] = useState(GARDEN_LAYOUTS[gardenId] || GARDEN_LAYOUTS.starter);
  const [playerPet, setPlayerPet] = useState(null);
  const [tileSystem] = useState(() => new ModularTileSystem());
  const [isCustomGarden, setIsCustomGarden] = useState(false);

  useEffect(() => {
    // Load saved garden layout if it exists
    const savedGarden = tileSystem.loadGardenLayout(gardenId);
    if (savedGarden) {
      setGardenLayout(savedGarden.layout);
      setIsCustomGarden(true);
    } else {
      // Try to parse garden from URL hash (for shared gardens)
      const hashParts = gardenId.split('-');
      if (hashParts.length > 1) {
        try {
          // Try to decode base64 garden code
          const gardenCode = hashParts.slice(1).join('-');
          const importedGarden = tileSystem.importGarden(gardenCode);
          if (importedGarden) {
            setGardenLayout(importedGarden);
            setIsCustomGarden(true);
          }
        } catch (error) {
          console.log('Could not import garden from hash, using default');
        }
      }
    }

    // Load player's pet
    const savedPet = localStorage.getItem('ct_selected_pet');
    if (savedPet) {
      const petSeed = walletConnected ? `wallet-${savedPet}` : `guest-${savedPet}`;
      const pet = generatePet(petSeed);
      pet.position = { x: 200, y: 150 };
      pet.owner = walletConnected ? 'wallet' : 'guest';
      setPlayerPet(pet);
    }

    // Generate some community pets
    const communityPets = [];
    for (let i = 0; i < 4; i++) {
      const pet = generatePet(`community-${gardenId}-${i}`);
      pet.position = { 
        x: 100 + (i * 80) + Math.random() * 40, 
        y: 100 + Math.random() * 100 
      };
      pet.owner = 'community';
      communityPets.push(pet);
    }
    setGardenPets(communityPets);
  }, [gardenId, walletConnected]);

  useEffect(() => {
    if (!canvasRef.current) return;
    renderGarden();
  }, [gardenLayout, gardenPets, playerPet, selectedPets]);

  const renderGarden = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const tileSize = 40;
    
    canvas.width = gardenLayout[0].length * tileSize;
    canvas.height = gardenLayout.length * tileSize;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Render tiles
    for (let row = 0; row < gardenLayout.length; row++) {
      for (let col = 0; col < gardenLayout[row].length; col++) {
        const tile = gardenLayout[row][col];
        const x = col * tileSize;
        const y = row * tileSize;
        
        ctx.fillStyle = TILES[tile] || '#2d5a2d';
        ctx.fillRect(x, y, tileSize, tileSize);
        
        // Add tile details
        if (tile === 'water') {
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.fillRect(x + 5, y + 5, tileSize - 10, tileSize - 10);
        } else if (tile === 'tree') {
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(x + 15, y + 25, 10, 15);
          ctx.fillStyle = '#228B22';
          ctx.beginPath();
          ctx.arc(x + 20, y + 20, 15, 0, Math.PI * 2);
          ctx.fill();
        } else if (tile === 'flower') {
          ctx.fillStyle = '#FF1493';
          ctx.beginPath();
          ctx.arc(x + 20, y + 20, 8, 0, Math.PI * 2);
          ctx.fill();
        } else if (tile === 'portal') {
          ctx.fillStyle = '#9370DB';
          ctx.beginPath();
          ctx.arc(x + 20, y + 20, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#E6E6FA';
          ctx.beginPath();
          ctx.arc(x + 20, y + 20, 8, 0, Math.PI * 2);
          ctx.fill();
        } else if (tile === 'chest') {
          ctx.fillStyle = '#DAA520';
          ctx.fillRect(x + 10, y + 15, 20, 15);
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(x + 12, y + 17, 16, 11);
        }
      }
    }
    
    // Render pets
    const allPets = playerPet ? [playerPet, ...gardenPets] : gardenPets;
    allPets.forEach((pet, index) => {
      if (!pet.position) return;
      
      // Create mini canvas for each pet
      const petCanvas = document.createElement('canvas');
      petCanvas.width = 32;
      petCanvas.height = 32;
      renderPetCanvas(pet, petCanvas, { width: 32, height: 32 });
      
      // Draw pet on main canvas
      ctx.drawImage(petCanvas, pet.position.x, pet.position.y);
      
      // Highlight selected pets
      if (selectedPets.has(index)) {
        ctx.strokeStyle = '#00FF99';
        ctx.lineWidth = 2;
        ctx.strokeRect(pet.position.x - 2, pet.position.y - 2, 36, 36);
      }
      
      // Draw owner indicator
      ctx.fillStyle = pet.owner === 'wallet' ? '#00FF99' : pet.owner === 'guest' ? '#FFD700' : '#888';
      ctx.fillRect(pet.position.x + 24, pet.position.y - 4, 8, 4);
    });
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const allPets = playerPet ? [playerPet, ...gardenPets] : gardenPets;
    
    // Check if clicked on a pet
    allPets.forEach((pet, index) => {
      if (!pet.position) return;
      
      const petX = pet.position.x;
      const petY = pet.position.y;
      
      if (x >= petX && x <= petX + 32 && y >= petY && y <= petY + 32) {
        // Right click for battle (or double click)
        if (e.button === 2 || e.detail === 2) {
          if (index > 0) { // Can't battle yourself
            setBattleOpponent(pet);
            setShowBattle(true);
            return;
          }
        }
        
        // Left click for selection
        const newSelected = new Set(selectedPets);
        if (selectedPets.has(index)) {
          newSelected.delete(index);
        } else {
          newSelected.add(index);
        }
        setSelectedPets(newSelected);
      }
    });
  };

  const startGroupExpedition = () => {
    if (selectedPets.size < 2) {
      alert('Select at least 2 pets to form an expedition party!');
      return;
    }
    setShowExpeditionForm(true);
  };

  const createNewGarden = () => {
    // Generate a unique garden layout (use existing template variations)
    const templates = Object.keys(GARDEN_LAYOUTS);
    const baseTemplate = templates[Math.floor(Math.random() * templates.length)];
    let newLayout = JSON.parse(JSON.stringify(GARDEN_LAYOUTS[baseTemplate]));
    
    // Randomize some tiles for uniqueness
    for (let row = 0; row < newLayout.length; row++) {
      for (let col = 0; col < newLayout[row].length; col++) {
        if (Math.random() < 0.2) { // 20% chance to randomize
          const tileTypes = Object.keys(TILES);
          newLayout[row][col] = tileTypes[Math.floor(Math.random() * tileTypes.length)];
        }
      }
    }
    
    const gardenCode = Math.random().toString(36).substring(7);
    const gardenName = `garden-${gardenCode}`;
    
    // Save the garden locally
    tileSystem.saveGardenLayout(gardenName, newLayout, {
      theme: 'community',
      createdBy: walletConnected ? 'wallet' : 'guest',
      timestamp: Date.now()
    });
    
    // Export garden as shareable code
    const shareableCode = tileSystem.exportGarden(newLayout);
    
    // Update URL and layout
    window.location.hash = gardenName;
    setGardenLayout(newLayout);
    setIsCustomGarden(true);
    
    // Copy to clipboard and notify user
    try {
      navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#garden-${shareableCode}`);
      alert(`Garden created and saved! Shareable link copied to clipboard: ${window.location.href}`);
    } catch (error) {
      alert(`Garden created! Share this URL: ${window.location.href}`);
    }
  };

  const handleBattleEnd = (result) => {
    console.log('Battle ended:', result);
    
    // Update pet stats based on battle result
    if (result.winner === 'player' && playerPet) {
      // Increase stats for winning
      playerPet.stats.hp = Math.min(playerPet.stats.hp + 5, 100);
      playerPet.battleWins = (playerPet.battleWins || 0) + 1;
      
      // Save updated pet
      localStorage.setItem(`ct_pet_${playerPet.seed}`, JSON.stringify(playerPet));
    }
    
    // Close battle
    setShowBattle(false);
    setBattleOpponent(null);
    
    // Re-render garden to show any changes
    renderGarden();
  };

  return (
    <div className="garden-container">
      <div className="garden-header">
        <h2>Pet Garden: {gardenId}</h2>
        <div className="garden-controls">
          <button className="btn" onClick={createNewGarden}>
            Create New Garden
          </button>
          <button 
            className="btn" 
            onClick={startGroupExpedition}
            disabled={selectedPets.size < 2}
          >
            Form Expedition ({selectedPets.size} selected)
          </button>
        </div>
      </div>
      
      <div className="garden-canvas-container">
        <canvas 
          ref={canvasRef}
          onClick={handleCanvasClick}
          onContextMenu={(e) => e.preventDefault()}
          style={{ 
            border: '2px solid #00FF99',
            cursor: 'pointer',
            imageRendering: 'pixelated',
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      </div>
      
      <div className="garden-info">
        <div className="legend">
          <span style={{ color: '#00FF99' }}>●</span> Wallet Pet
          <span style={{ color: '#FFD700' }}>●</span> Guest Pet  
          <span style={{ color: '#888' }}>●</span> Community Pet
        </div>
        <p>Left-click pets to select for expeditions. Right-click or double-click to battle!</p>
        {playerPet && (
          <div className="player-pet-info">
            Your Pet: {playerPet.species} ({playerPet.rarity})
          </div>
        )}
      </div>

      {showExpeditionForm && (
        <div className="expedition-modal">
          <div className="modal-content">
            <h3>Form Expedition Party</h3>
            <p>{selectedPets.size} pets selected for adventure!</p>
            <div className="expedition-options">
              <button className="btn" onClick={() => {
                // Create expedition party from selected pets
                const allPets = playerPet ? [playerPet, ...gardenPets] : gardenPets;
                const selectedPetObjects = Array.from(selectedPets).map(index => allPets[index]);
                setExpeditionParty(selectedPetObjects);
                setShowExpeditionForm(false);
                setShowExpedition(true);
                setSelectedPets(new Set());
              }}>
                Launch Expedition
              </button>
              <button className="btn" onClick={() => setShowExpeditionForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showExpedition && (
        <div className="expedition-overlay">
          <GroupExpedition
            initialParty={expeditionParty}
            expeditionId={`garden-${gardenId}-${Date.now()}`}
            onExit={() => setShowExpedition(false)}
            walletConnected={walletConnected}
          />
        </div>
      )}

      {showBattle && battleOpponent && playerPet && (
        <div className="battle-overlay">
          <SocialBattleSystem
            playerPet={playerPet}
            opponentPet={battleOpponent}
            onBattleEnd={handleBattleEnd}
          />
        </div>
      )}
    </div>
  );
}