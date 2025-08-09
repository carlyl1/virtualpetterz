import React, { useState, useRef, useEffect } from 'react';
import tileSystem from '../systems/ModularTileSystem';
import progressionSystem from '../systems/PersistentProgression';

export default function GardenBuilder({ playerLevel = 1, onSave, onExit }) {
  const canvasRef = useRef();
  const [selectedTile, setSelectedTile] = useState('grass');
  const [currentBiome, setCurrentBiome] = useState('meadow');
  const [gardenLayout, setGardenLayout] = useState(null);
  const [gardenEffects, setGardenEffects] = useState({});
  const [activeCategory, setActiveCategory] = useState('terrain');
  const [showEffects, setShowEffects] = useState(false);
  const [gardenName, setGardenName] = useState('');
  const [savedGardens, setSavedGardens] = useState([]);
  const [showSavedGardens, setShowSavedGardens] = useState(false);

  const tileSize = 40;
  const gridWidth = 10;
  const gridHeight = 8;

  useEffect(() => {
    // Initialize with a basic garden layout
    const initialLayout = tileSystem.generateGardenLayout(gridWidth, gridHeight, currentBiome, playerLevel);
    setGardenLayout(initialLayout);
    loadSavedGardens();
  }, [currentBiome, playerLevel]);

  useEffect(() => {
    if (gardenLayout) {
      renderGarden();
      calculateEffects();
    }
  }, [gardenLayout, selectedTile]);

  const loadSavedGardens = () => {
    const gardens = tileSystem.getSavedGardens();
    setSavedGardens(gardens);
  };

  const renderGarden = () => {
    if (!canvasRef.current || !gardenLayout) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = gridWidth * tileSize;
    canvas.height = gridHeight * tileSize;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Render grid background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= gridWidth; x++) {
      ctx.beginPath();
      ctx.moveTo(x * tileSize, 0);
      ctx.lineTo(x * tileSize, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= gridHeight; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * tileSize);
      ctx.lineTo(canvas.width, y * tileSize);
      ctx.stroke();
    }
    
    // Render tiles
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const tileId = gardenLayout[y][x];
        const tile = tileSystem.getTileById(tileId);
        
        const tileX = x * tileSize;
        const tileY = y * tileSize;
        
        // Fill tile background
        ctx.fillStyle = tile.color;
        ctx.fillRect(tileX, tileY, tileSize, tileSize);
        
        // Add tile details
        renderTileDetails(ctx, tile, tileX, tileY, tileSize);
      }
    }
  };

  const renderTileDetails = (ctx, tile, x, y, size) => {
    ctx.save();
    
    switch (tile.id) {
      case 'water':
        // Add water shimmer effect
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(x + 5, y + 5, size - 10, size - 10);
        break;
        
      case 'tree':
        // Draw tree trunk and leaves
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 15, y + 25, 10, 15);
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(x + 20, y + 20, 15, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'flower':
        // Draw flower
        ctx.fillStyle = '#FF1493';
        ctx.beginPath();
        ctx.arc(x + 20, y + 20, 8, 0, Math.PI * 2);
        ctx.fill();
        // Add petals
        ctx.fillStyle = '#FFB6C1';
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const petalX = x + 20 + Math.cos(angle) * 12;
          const petalY = y + 20 + Math.sin(angle) * 12;
          ctx.beginPath();
          ctx.arc(petalX, petalY, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      case 'portal':
        // Draw portal with glow effect
        ctx.fillStyle = '#9370DB';
        ctx.beginPath();
        ctx.arc(x + 20, y + 20, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#E6E6FA';
        ctx.beginPath();
        ctx.arc(x + 20, y + 20, 8, 0, Math.PI * 2);
        ctx.fill();
        // Add sparkles
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 4; i++) {
          const sparkleX = x + 10 + Math.random() * 20;
          const sparkleY = y + 10 + Math.random() * 20;
          ctx.fillRect(sparkleX, sparkleY, 2, 2);
        }
        break;
        
      case 'chest':
        // Draw treasure chest
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(x + 10, y + 15, 20, 15);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 12, y + 17, 16, 11);
        ctx.fillStyle = '#B8860B';
        ctx.fillRect(x + 18, y + 19, 4, 3);
        break;
        
      case 'crystal':
        // Draw energy crystal
        ctx.fillStyle = '#00FFFF';
        ctx.beginPath();
        ctx.moveTo(x + 20, y + 8);
        ctx.lineTo(x + 30, y + 18);
        ctx.lineTo(x + 25, y + 32);
        ctx.lineTo(x + 15, y + 32);
        ctx.lineTo(x + 10, y + 18);
        ctx.closePath();
        ctx.fill();
        // Add glow
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 10;
        ctx.stroke();
        break;
        
      case 'fountain':
        // Draw fountain
        ctx.fillStyle = '#87CEEB';
        ctx.beginPath();
        ctx.arc(x + 20, y + 25, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#B0E0E6';
        ctx.beginPath();
        ctx.arc(x + 20, y + 20, 6, 0, Math.PI * 2);
        ctx.fill();
        // Add water drops
        ctx.fillStyle = 'rgba(135, 206, 235, 0.7)';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(x + 18 + i * 2, y + 15 - i * 2, 1, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
    }
    
    // Add rarity border for special tiles
    if (tile.rarity === 'rare') {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
    } else if (tile.rarity === 'epic') {
      ctx.strokeStyle = '#9932CC';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
    } else if (tile.rarity === 'legendary') {
      ctx.strokeStyle = '#FF4500';
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
    }
    
    ctx.restore();
  };

  const handleCanvasClick = (e) => {
    if (!canvasRef.current || !gardenLayout) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / tileSize);
    const y = Math.floor((e.clientY - rect.top) / tileSize);
    
    if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
      const newLayout = tileSystem.placeTile(gardenLayout, x, y, selectedTile);
      if (newLayout) {
        setGardenLayout(newLayout);
      }
    }
  };

  const calculateEffects = () => {
    if (!gardenLayout) return;
    
    const { effects, totalCost } = tileSystem.calculateGardenEffects(gardenLayout);
    setGardenEffects({ ...effects, totalCost });
  };

  const generateNewGarden = () => {
    const newLayout = tileSystem.generateGardenLayout(gridWidth, gridHeight, currentBiome, playerLevel);
    setGardenLayout(newLayout);
  };

  const clearGarden = () => {
    const newLayout = Array(gridHeight).fill().map(() => Array(gridWidth).fill('grass'));
    setGardenLayout(newLayout);
  };

  const saveGarden = () => {
    if (!gardenName.trim()) {
      alert('Please enter a garden name');
      return;
    }
    
    tileSystem.saveGardenLayout(gardenName, gardenLayout, gardenEffects);
    loadSavedGardens();
    setGardenName('');
    alert(`Garden "${gardenName}" saved!`);
  };

  const loadGarden = (name) => {
    const garden = tileSystem.loadGardenLayout(name);
    if (garden) {
      setGardenLayout(garden.layout);
      setShowSavedGardens(false);
    }
  };

  const exportGarden = () => {
    const code = tileSystem.exportGarden(gardenLayout);
    navigator.clipboard.writeText(code);
    alert('Garden code copied to clipboard! Share it with friends.');
  };

  const importGarden = () => {
    const code = prompt('Enter garden code:');
    if (code) {
      const layout = tileSystem.importGarden(code);
      if (layout) {
        setGardenLayout(layout);
        alert('Garden imported successfully!');
      } else {
        alert('Invalid garden code');
      }
    }
  };

  const unlockedTiles = tileSystem.getUnlockedTiles(playerLevel);
  const availableCategories = [...new Set(unlockedTiles.map(tile => tile.category))];
  const categoryTiles = unlockedTiles.filter(tile => tile.category === activeCategory);

  return (
    <div className="garden-builder">
      <div className="builder-header">
        <h2>🏗️ Garden Builder</h2>
        <div className="builder-controls">
          <button onClick={generateNewGarden} className="btn">🎲 Generate</button>
          <button onClick={clearGarden} className="btn">🧹 Clear</button>
          <button onClick={() => setShowEffects(!showEffects)} className="btn">
            📊 {showEffects ? 'Hide' : 'Show'} Effects
          </button>
          <button onClick={() => setShowSavedGardens(!showSavedGardens)} className="btn">
            💾 Saved Gardens
          </button>
        </div>
      </div>

      <div className="builder-main">
        <div className="builder-sidebar">
          <div className="biome-selector">
            <h3>Biome</h3>
            <select 
              value={currentBiome} 
              onChange={(e) => setCurrentBiome(e.target.value)}
              className="biome-select"
            >
              {Object.entries(tileSystem.biomes).map(([id, biome]) => (
                <option key={id} value={id} disabled={playerLevel < biome.unlockLevel}>
                  {biome.name} {playerLevel < biome.unlockLevel ? `(Lv. ${biome.unlockLevel})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="tile-categories">
            <h3>Categories</h3>
            <div className="category-buttons">
              {availableCategories.map(category => (
                <button
                  key={category}
                  className={`category-btn ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="tile-palette">
            <h3>Tiles</h3>
            <div className="tile-grid">
              {categoryTiles.map(tile => (
                <div
                  key={tile.id}
                  className={`tile-option ${selectedTile === tile.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTile(tile.id)}
                  style={{ backgroundColor: tile.color }}
                  title={`${tile.name} - Cost: ${tile.cost}`}
                >
                  <div className="tile-preview" style={{ backgroundColor: tile.color }}>
                    {tile.rarity !== 'common' && <div className="rarity-indicator">{tile.rarity[0].toUpperCase()}</div>}
                  </div>
                  <div className="tile-name">{tile.name}</div>
                  <div className="tile-cost">${tile.cost}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="builder-canvas">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="garden-canvas"
            style={{
              border: '2px solid #00FF99',
              cursor: 'crosshair',
              imageRendering: 'pixelated'
            }}
          />
        </div>
      </div>

      {showEffects && (
        <div className="garden-effects">
          <h3>Garden Effects</h3>
          <div className="effects-grid">
            {Object.entries(gardenEffects).map(([effect, value]) => (
              effect !== 'totalCost' && (
                <div key={effect} className="effect-item">
                  <span className="effect-name">{effect.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                  <span className="effect-value">+{value}</span>
                </div>
              )
            ))}
            <div className="effect-item cost">
              <span className="effect-name">Total Cost</span>
              <span className="effect-value">${gardenEffects.totalCost || 0}</span>
            </div>
          </div>
        </div>
      )}

      <div className="builder-actions">
        <div className="save-section">
          <input
            type="text"
            value={gardenName}
            onChange={(e) => setGardenName(e.target.value)}
            placeholder="Enter garden name"
            className="garden-name-input"
          />
          <button onClick={saveGarden} className="btn save-btn">💾 Save Garden</button>
        </div>
        
        <div className="share-section">
          <button onClick={exportGarden} className="btn">📤 Export</button>
          <button onClick={importGarden} className="btn">📥 Import</button>
        </div>
        
        <button onClick={onExit} className="btn exit-btn">🏠 Back to Garden</button>
      </div>

      {showSavedGardens && (
        <div className="saved-gardens-modal">
          <div className="modal-content">
            <h3>Saved Gardens</h3>
            <div className="saved-gardens-list">
              {savedGardens.map((garden, index) => (
                <div key={index} className="saved-garden-item">
                  <div className="garden-info">
                    <div className="garden-name">{garden.name}</div>
                    <div className="garden-date">{new Date(garden.createdAt).toLocaleDateString()}</div>
                  </div>
                  <button 
                    onClick={() => loadGarden(garden.name)} 
                    className="btn load-btn"
                  >
                    Load
                  </button>
                </div>
              ))}
              {savedGardens.length === 0 && (
                <div className="no-gardens">No saved gardens yet</div>
              )}
            </div>
            <button onClick={() => setShowSavedGardens(false)} className="btn">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}