// Modular Tile System for Garden Environments
export class ModularTileSystem {
  constructor() {
    this.tileSize = 40;
    this.tileTypes = this.initializeTileTypes();
    this.biomes = this.initializeBiomes();
    this.structures = this.initializeStructures();
    this.loadCustomTiles();
  }

  initializeTileTypes() {
    return {
      // Basic terrain
      grass: {
        id: 'grass',
        name: 'Grass',
        color: '#2d5a2d',
        walkable: true,
        category: 'terrain',
        rarity: 'common',
        effects: {
          happiness: 0,
          energy: 0,
          growth: 1
        },
        cost: 0
      },
      dirt: {
        id: 'dirt',
        name: 'Dirt Path',
        color: '#8B4513',
        walkable: true,
        category: 'terrain',
        rarity: 'common',
        effects: { speed: 1.2 },
        cost: 1
      },
      stone: {
        id: 'stone',
        name: 'Stone Path',
        color: '#696969',
        walkable: true,
        category: 'terrain',
        rarity: 'common',
        effects: { speed: 1.5, durability: 2 },
        cost: 3
      },
      water: {
        id: 'water',
        name: 'Water',
        color: '#1E90FF',
        walkable: false,
        category: 'terrain',
        rarity: 'common',
        effects: { cooling: 2, beauty: 1 },
        cost: 2,
        animated: true
      },
      sand: {
        id: 'sand',
        name: 'Sand',
        color: '#F4A460',
        walkable: true,
        category: 'terrain',
        rarity: 'common',
        effects: { temperature: 1 },
        cost: 1
      },

      // Vegetation
      tree: {
        id: 'tree',
        name: 'Tree',
        color: '#006400',
        walkable: false,
        category: 'vegetation',
        rarity: 'common',
        effects: { 
          shade: 2, 
          oxygen: 3, 
          beauty: 2,
          fruit: 0.1 // 10% chance to produce fruit daily
        },
        cost: 5,
        height: 2
      },
      bush: {
        id: 'bush',
        name: 'Bush',
        color: '#228B22',
        walkable: false,
        category: 'vegetation',
        rarity: 'common',
        effects: { 
          beauty: 1,
          berries: 0.15
        },
        cost: 2,
        height: 1
      },
      flower: {
        id: 'flower',
        name: 'Flower',
        color: '#FF69B4',
        walkable: true,
        category: 'vegetation',
        rarity: 'common',
        effects: { 
          beauty: 3,
          happiness: 1,
          pollination: 0.2
        },
        cost: 3
      },

      // Structures
      bench: {
        id: 'bench',
        name: 'Garden Bench',
        color: '#A0522D',
        walkable: false,
        category: 'furniture',
        rarity: 'uncommon',
        effects: { 
          rest: 3,
          happiness: 2,
          social: 1
        },
        cost: 15,
        interactive: true
      },
      lamp: {
        id: 'lamp',
        name: 'Garden Lamp',
        color: '#FFD700',
        walkable: false,
        category: 'lighting',
        rarity: 'uncommon',
        effects: { 
          light: 5,
          safety: 2,
          beauty: 1
        },
        cost: 20,
        animated: true,
        lightRadius: 3
      },
      fence: {
        id: 'fence',
        name: 'Garden Fence',
        color: '#8B4513',
        walkable: false,
        category: 'structure',
        rarity: 'common',
        effects: { 
          protection: 2,
          privacy: 1
        },
        cost: 8,
        height: 1
      },

      // Special tiles
      portal: {
        id: 'portal',
        name: 'Mystical Portal',
        color: '#9370DB',
        walkable: true,
        category: 'magical',
        rarity: 'legendary',
        effects: { 
          magic: 5,
          teleport: true,
          experience: 2
        },
        cost: 100,
        animated: true,
        special: true
      },
      chest: {
        id: 'chest',
        name: 'Treasure Chest',
        color: '#DAA520',
        walkable: false,
        category: 'treasure',
        rarity: 'rare',
        effects: { 
          treasure: true,
          mystery: 3
        },
        cost: 50,
        interactive: true,
        loot: {
          tokens: { min: 10, max: 100 },
          items: ['rare_seed', 'golden_food', 'experience_potion']
        }
      },

      // Advanced tiles
      crystal: {
        id: 'crystal',
        name: 'Energy Crystal',
        color: '#00FFFF',
        walkable: false,
        category: 'magical',
        rarity: 'epic',
        effects: { 
          energy: 5,
          magic: 3,
          regeneration: 2
        },
        cost: 75,
        animated: true,
        lightRadius: 2
      },
      mushroom_ring: {
        id: 'mushroom_ring',
        name: 'Fairy Ring',
        color: '#DDA0DD',
        walkable: true,
        category: 'magical',
        rarity: 'rare',
        effects: { 
          magic: 4,
          luck: 3,
          fairy_visits: 0.05
        },
        cost: 60,
        special: true
      },
      fountain: {
        id: 'fountain',
        name: 'Healing Fountain',
        color: '#87CEEB',
        walkable: false,
        category: 'water_feature',
        rarity: 'epic',
        effects: { 
          healing: 4,
          beauty: 4,
          tranquility: 3,
          water_blessing: true
        },
        cost: 150,
        animated: true,
        interactive: true,
        size: { width: 2, height: 2 } // Multi-tile structure
      }
    };
  }

  initializeBiomes() {
    return {
      meadow: {
        name: 'Peaceful Meadow',
        preferredTiles: ['grass', 'flower', 'tree'],
        effects: { happiness: 2, tranquility: 3 },
        backgroundColor: '#E6FFE6',
        unlockLevel: 1
      },
      forest: {
        name: 'Enchanted Forest',
        preferredTiles: ['tree', 'bush', 'mushroom_ring'],
        effects: { magic: 2, mystery: 2 },
        backgroundColor: '#E6F3E6',
        unlockLevel: 5
      },
      desert_oasis: {
        name: 'Desert Oasis',
        preferredTiles: ['sand', 'water', 'fountain'],
        effects: { endurance: 3, rarity: 1 },
        backgroundColor: '#FFF8DC',
        unlockLevel: 10
      },
      mystical_realm: {
        name: 'Mystical Realm',
        preferredTiles: ['portal', 'crystal', 'lamp'],
        effects: { magic: 5, experience: 3 },
        backgroundColor: '#E6E6FA',
        unlockLevel: 20
      },
      zen_garden: {
        name: 'Zen Garden',
        preferredTiles: ['stone', 'bench', 'fountain'],
        effects: { tranquility: 4, focus: 3 },
        backgroundColor: '#F0F8FF',
        unlockLevel: 15
      }
    };
  }

  initializeStructures() {
    return {
      pet_house: {
        name: 'Pet House',
        tiles: [
          ['fence', 'fence', 'fence'],
          ['fence', 'grass', 'fence'],
          ['fence', 'fence', 'fence']
        ],
        effects: { shelter: 5, comfort: 3 },
        cost: 100,
        unlockLevel: 3
      },
      flower_garden: {
        name: 'Flower Garden',
        tiles: [
          ['flower', 'flower', 'flower'],
          ['flower', 'bench', 'flower'],
          ['flower', 'flower', 'flower']
        ],
        effects: { beauty: 8, happiness: 5 },
        cost: 80,
        unlockLevel: 2
      },
      meditation_circle: {
        name: 'Meditation Circle',
        tiles: [
          ['stone', 'stone', 'stone'],
          ['stone', 'fountain', 'stone'],
          ['stone', 'stone', 'stone']
        ],
        effects: { tranquility: 10, focus: 5 },
        cost: 200,
        unlockLevel: 12
      },
      magical_grove: {
        name: 'Magical Grove',
        tiles: [
          ['tree', 'mushroom_ring', 'tree'],
          ['crystal', 'portal', 'crystal'],
          ['tree', 'mushroom_ring', 'tree']
        ],
        effects: { magic: 15, mystery: 8 },
        cost: 500,
        unlockLevel: 25
      }
    };
  }

  loadCustomTiles() {
    // Load user-created custom tiles from localStorage
    const customTiles = localStorage.getItem('ct_custom_tiles');
    if (customTiles) {
      try {
        const tiles = JSON.parse(customTiles);
        Object.assign(this.tileTypes, tiles);
      } catch (error) {
        console.error('Error loading custom tiles:', error);
      }
    }
  }

  saveCustomTiles() {
    // Save user-created tiles to localStorage
    const customTiles = {};
    Object.entries(this.tileTypes).forEach(([id, tile]) => {
      if (tile.custom) {
        customTiles[id] = tile;
      }
    });
    localStorage.setItem('ct_custom_tiles', JSON.stringify(customTiles));
  }

  getTileById(id) {
    return this.tileTypes[id] || this.tileTypes.grass;
  }

  getTilesByCategory(category) {
    return Object.values(this.tileTypes).filter(tile => tile.category === category);
  }

  getTilesByRarity(rarity) {
    return Object.values(this.tileTypes).filter(tile => tile.rarity === rarity);
  }

  getUnlockedTiles(playerLevel) {
    return Object.values(this.tileTypes).filter(tile => 
      !tile.unlockLevel || playerLevel >= tile.unlockLevel
    );
  }

  // Garden layout generator
  generateGardenLayout(width = 8, height = 6, biome = 'meadow', playerLevel = 1) {
    const layout = [];
    const biomeData = this.biomes[biome];
    const unlockedTiles = this.getUnlockedTiles(playerLevel);
    
    for (let row = 0; row < height; row++) {
      const layoutRow = [];
      for (let col = 0; col < width; col++) {
        let tileId = 'grass'; // Default
        
        // Border logic
        if (row === 0 || row === height - 1 || col === 0 || col === width - 1) {
          if (Math.random() < 0.3) {
            tileId = 'fence';
          }
        }
        // Biome-specific generation
        else if (biomeData && Math.random() < 0.7) {
          const availableTiles = biomeData.preferredTiles.filter(id => 
            unlockedTiles.some(tile => tile.id === id)
          );
          if (availableTiles.length > 0) {
            tileId = availableTiles[Math.floor(Math.random() * availableTiles.length)];
          }
        }
        // Random special tiles
        else if (Math.random() < 0.1 && playerLevel >= 5) {
          const specialTiles = unlockedTiles.filter(tile => tile.special);
          if (specialTiles.length > 0) {
            tileId = specialTiles[Math.floor(Math.random() * specialTiles.length)].id;
          }
        }
        
        layoutRow.push(tileId);
      }
      layout.push(layoutRow);
    }
    
    return layout;
  }

  // Tile placement validation
  canPlaceTile(layout, x, y, tileId) {
    const tile = this.getTileById(tileId);
    const width = layout[0]?.length || 0;
    const height = layout.length;
    
    // Check bounds
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return false;
    }
    
    // Check if tile has size requirements
    if (tile.size) {
      const { width: tileWidth, height: tileHeight } = tile.size;
      if (x + tileWidth > width || y + tileHeight > height) {
        return false;
      }
      
      // Check if all required spaces are available
      for (let dy = 0; dy < tileHeight; dy++) {
        for (let dx = 0; dx < tileWidth; dx++) {
          const currentTile = this.getTileById(layout[y + dy][x + dx]);
          if (!currentTile.walkable && currentTile.id !== 'grass') {
            return false;
          }
        }
      }
    }
    
    return true;
  }

  // Place tile with validation
  placeTile(layout, x, y, tileId) {
    if (!this.canPlaceTile(layout, x, y, tileId)) {
      return false;
    }
    
    const tile = this.getTileById(tileId);
    const newLayout = layout.map(row => [...row]);
    
    if (tile.size) {
      const { width: tileWidth, height: tileHeight } = tile.size;
      for (let dy = 0; dy < tileHeight; dy++) {
        for (let dx = 0; dx < tileWidth; dx++) {
          newLayout[y + dy][x + dx] = tileId;
        }
      }
    } else {
      newLayout[y][x] = tileId;
    }
    
    return newLayout;
  }

  // Calculate garden effects
  calculateGardenEffects(layout) {
    const effects = {};
    let totalCost = 0;
    
    for (let y = 0; y < layout.length; y++) {
      for (let x = 0; x < layout[y].length; x++) {
        const tile = this.getTileById(layout[y][x]);
        totalCost += tile.cost;
        
        // Sum up all effects
        if (tile.effects) {
          Object.entries(tile.effects).forEach(([effect, value]) => {
            effects[effect] = (effects[effect] || 0) + value;
          });
        }
      }
    }
    
    // Calculate synergy bonuses
    const synergyBonus = this.calculateSynergyBonus(layout);
    Object.entries(synergyBonus).forEach(([effect, value]) => {
      effects[effect] = (effects[effect] || 0) + value;
    });
    
    return { effects, totalCost };
  }

  calculateSynergyBonus(layout) {
    const bonus = {};
    const tileCount = {};
    
    // Count tiles by category
    for (let y = 0; y < layout.length; y++) {
      for (let x = 0; x < layout[y].length; x++) {
        const tile = this.getTileById(layout[y][x]);
        tileCount[tile.category] = (tileCount[tile.category] || 0) + 1;
      }
    }
    
    // Calculate synergy bonuses
    if (tileCount.vegetation >= 5) {
      bonus.naturalHarmony = 3;
      bonus.beauty = 2;
    }
    
    if (tileCount.water_feature && tileCount.vegetation >= 3) {
      bonus.oasisEffect = 4;
      bonus.tranquility = 2;
    }
    
    if (tileCount.magical >= 3) {
      bonus.magicalResonance = 5;
      bonus.experience = 3;
    }
    
    if (tileCount.furniture >= 2 && tileCount.lighting >= 1) {
      bonus.cozyAtmosphere = 3;
      bonus.happiness = 2;
    }
    
    return bonus;
  }

  // Garden evolution system
  evolveTile(tileId, evolutionType = 'time') {
    const tile = this.getTileById(tileId);
    const evolutions = {
      time: {
        flower: 'bush',
        bush: 'tree',
        grass: 'flower'
      },
      magic: {
        tree: 'crystal',
        water: 'fountain',
        stone: 'mystical_stone'
      },
      care: {
        grass: 'lush_grass',
        flower: 'perfect_flower',
        tree: 'ancient_tree'
      }
    };
    
    const evolutionMap = evolutions[evolutionType];
    return evolutionMap?.[tileId] || tileId;
  }

  // Save/Load garden layouts
  saveGardenLayout(name, layout, effects) {
    const gardens = JSON.parse(localStorage.getItem('ct_saved_gardens') || '{}');
    gardens[name] = {
      layout,
      effects,
      createdAt: Date.now(),
      version: '1.0.0'
    };
    localStorage.setItem('ct_saved_gardens', JSON.stringify(gardens));
  }

  loadGardenLayout(name) {
    const gardens = JSON.parse(localStorage.getItem('ct_saved_gardens') || '{}');
    return gardens[name] || null;
  }

  getSavedGardens() {
    const gardens = JSON.parse(localStorage.getItem('ct_saved_gardens') || '{}');
    return Object.entries(gardens).map(([name, data]) => ({
      name,
      ...data
    }));
  }

  // Export garden as shareable code
  exportGarden(layout) {
    const compressed = JSON.stringify(layout);
    return btoa(compressed); // Base64 encode
  }

  importGarden(code) {
    try {
      const compressed = atob(code); // Base64 decode
      return JSON.parse(compressed);
    } catch (error) {
      console.error('Invalid garden code:', error);
      return null;
    }
  }
}

// Singleton instance
export const tileSystem = new ModularTileSystem();
export default tileSystem;