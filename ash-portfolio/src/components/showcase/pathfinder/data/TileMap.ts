// Tile mapping for Kenney Roguelike Modern City tileset
// Based on the 37x28 grid (1036 tiles total)

export enum TileType {
  ROAD = 'road',
  BUILDING = 'building',
  TREE = 'tree',
  WATER = 'water',
  GRASS = 'grass',
  SPAWN = 'spawn',
  DESTINATION = 'destination',
  CAR = 'car'
}

// Tile indices for Kenney Roguelike Modern City tileset (37x28 grid, 1036 tiles total)
// Based on visual analysis of the tileset preview images
export const TILE_INDICES = {
  // Road tiles with proper intersections and lane markings
  ROAD: {
    // Basic road segments
    HORIZONTAL: [185, 186, 187], // Horizontal road with lane markings
    VERTICAL: [148, 185, 222], // Vertical road with lane markings
    
    // Intersections and corners
    INTERSECTION: 186, // 4-way intersection
    CORNER_TL: 148, // Top-left corner
    CORNER_TR: 150, // Top-right corner  
    CORNER_BL: 259, // Bottom-left corner
    CORNER_BR: 261, // Bottom-right corner
    
    // T-junctions
    T_UP: 149, // T-junction opening up
    T_DOWN: 260, // T-junction opening down
    T_LEFT: 185, // T-junction opening left
    T_RIGHT: 187, // T-junction opening right
  },
  
  // Multi-tile building structures (defined as top-left tile + dimensions)
  BUILDINGS: {
    // Small buildings (2x2)
    HOUSE_SMALL_1: { topLeft: 0, width: 2, height: 2 }, // Red brick house
    HOUSE_SMALL_2: { topLeft: 2, width: 2, height: 2 }, // Blue house
    HOUSE_SMALL_3: { topLeft: 4, width: 2, height: 2 }, // Green house
    
    // Medium buildings (3x2)
    SHOP_1: { topLeft: 6, width: 3, height: 2 }, // Shop with awning
    SHOP_2: { topLeft: 9, width: 3, height: 2 }, // Different shop style
    
    // Large buildings (4x3)
    OFFICE_1: { topLeft: 74, width: 4, height: 3 }, // Office building
    FACTORY_1: { topLeft: 111, width: 4, height: 3 }, // Factory building
    
    // Skyscrapers (3x4)
    SKYSCRAPER_1: { topLeft: 77, width: 3, height: 4 }, // Tall building
  },
  
  // Single-tile decorations and nature
  DECORATIONS: {
    // Trees (single tiles)
    TREE_1: 370, // Small green tree
    TREE_2: 371, // Medium tree
    TREE_3: 372, // Large tree
    
    // Grass and ground
    GRASS_1: 592, // Light grass
    GRASS_2: 593, // Medium grass  
    GRASS_3: 594, // Dark grass
    
    // Small decorations
    BUSH_1: 518, // Small bush
    BUSH_2: 519, // Medium bush
    FLOWER_1: 520, // Flowers
    
    // Urban decorations
    TRASH_CAN: 740, // Trash can
    BENCH: 741, // Park bench
    LAMP_POST: 742, // Street lamp
    TRAFFIC_CONE: 743, // Traffic cone for user obstacles
  },
  
  // Vehicle sprites
  VEHICLES: {
    CAR_RED: 814,
    CAR_BLUE: 851, 
    CAR_GREEN: 888,
    CAR_YELLOW: 925,
    TRUCK_1: 815,
    TRUCK_2: 852,
  }
};

// Helper function to get random tile from array
export function getRandomTile(tileArray: number[]): number {
  return tileArray[Math.floor(Math.random() * tileArray.length)];
}

// Sprite sheet configuration
export const SPRITE_SHEET_CONFIG = {
  path: '/assets/city-tileset/tilemap.png',
  tileSize: 16, // Each tile is 16x16 pixels
  columns: 37,  // 37 tiles per row
  rows: 28,     // 28 rows total
  spacing: 1    // 1px spacing between tiles
};

// Helper function to get tile position in sprite sheet
export const getTilePosition = (tileIndex: number): { x: number; y: number } => {
  const col = tileIndex % SPRITE_SHEET_CONFIG.columns;
  const row = Math.floor(tileIndex / SPRITE_SHEET_CONFIG.columns);
  
  return {
    x: col * (SPRITE_SHEET_CONFIG.tileSize + SPRITE_SHEET_CONFIG.spacing),
    y: row * (SPRITE_SHEET_CONFIG.tileSize + SPRITE_SHEET_CONFIG.spacing)
  };
};

// Helper function to get tile path (kept for compatibility)
export function getTilePath(tileIndex: number): string {
  return SPRITE_SHEET_CONFIG.path;
}

// City layout generator - creates a more realistic city with roads and building clusters
export interface CityTile {
  type: TileType;
  tileIndex: number;
  isObstacle: boolean;
  isUserAdded?: boolean; // Track if this obstacle was added by the user
}

export class CityLayoutGenerator {
  private layout: CityTile[][];
  private roads: boolean[][];
  private rows: number;
  private cols: number;

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.layout = Array.from({ length: rows }, () => 
      Array.from({ length: cols }, () => ({
        type: TileType.GRASS,
        tileIndex: TILE_INDICES.DECORATIONS.GRASS_1,
        isObstacle: true
      }))
    );
    this.roads = Array.from({ length: rows }, () => Array(cols).fill(false));
  }

  public generateCity(): CityTile[][] {
    // Step 1: Generate maze-like road network
    this.generateMazeRoads();
    
    // Step 2: Place multi-tile buildings
    this.placeBuildings();
    
    // Step 3: Fill remaining areas with decorations
    this.addDecorations();
    
    return this.layout;
  }

  private generateMazeRoads(): void {
    // Create a maze-like road network
    // Start with entry point on left
    const entryRow = Math.floor(this.rows / 2);
    this.roads[entryRow][0] = true;
    
    // Create main path from left to right with turns
    let currentRow = entryRow;
    let currentCol = 0;
    
    // Path to the right with some vertical movement
    while (currentCol < this.cols - 1) {
      this.roads[currentRow][currentCol] = true;
      
      // Randomly decide to turn or continue straight
      if (Math.random() < 0.3 && currentCol > 5 && currentCol < this.cols - 10) {
        // Turn up or down
        const turnDirection = Math.random() < 0.5 ? -1 : 1;
        const turnLength = Math.floor(Math.random() * 5) + 2;
        
        for (let i = 0; i < turnLength && currentRow + (i * turnDirection) >= 1 && currentRow + (i * turnDirection) < this.rows - 1; i++) {
          currentRow += turnDirection;
          this.roads[currentRow][currentCol] = true;
        }
      }
      
      currentCol++;
    }
    
    // Ensure exit on the right
    this.roads[currentRow][this.cols - 1] = true;
    
    // Add some branching paths
    this.addBranchingPaths();
    
    // Convert road boolean array to actual road tiles
    this.applyRoadTiles();
  }

  private addBranchingPaths(): void {
    // Add some vertical branches
    for (let col = 5; col < this.cols - 5; col += 8) {
      if (this.roads[Math.floor(this.rows / 2)][col]) {
        // Branch up
        for (let row = Math.floor(this.rows / 2) - 1; row >= 2; row--) {
          if (Math.random() < 0.7) {
            this.roads[row][col] = true;
          } else {
            break;
          }
        }
        
        // Branch down  
        for (let row = Math.floor(this.rows / 2) + 1; row < this.rows - 2; row++) {
          if (Math.random() < 0.7) {
            this.roads[row][col] = true;
          } else {
            break;
          }
        }
      }
    }
    
    // Add some horizontal branches
    for (let row = 3; row < this.rows - 3; row += 6) {
      for (let col = 2; col < this.cols - 2; col++) {
        if (this.roads[row][col]) {
          // Small horizontal branch
          const branchLength = Math.floor(Math.random() * 4) + 2;
          const direction = Math.random() < 0.5 ? -1 : 1;
          
          for (let i = 1; i <= branchLength; i++) {
            const newCol = col + (i * direction);
            if (newCol >= 1 && newCol < this.cols - 1) {
              this.roads[row][newCol] = true;
            }
          }
          break;
        }
      }
    }
  }

  private applyRoadTiles(): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.roads[row][col]) {
          // Determine road tile type based on neighbors
          const hasUp = row > 0 && this.roads[row - 1][col];
          const hasDown = row < this.rows - 1 && this.roads[row + 1][col];
          const hasLeft = col > 0 && this.roads[row][col - 1];
          const hasRight = col < this.cols - 1 && this.roads[row][col + 1];
          
          let tileIndex: number;
          
          // Determine tile based on connections
          if (hasUp && hasDown && hasLeft && hasRight) {
            tileIndex = TILE_INDICES.ROAD.INTERSECTION;
          } else if (hasUp && hasDown && hasLeft) {
            tileIndex = TILE_INDICES.ROAD.T_RIGHT;
          } else if (hasUp && hasDown && hasRight) {
            tileIndex = TILE_INDICES.ROAD.T_LEFT;
          } else if (hasLeft && hasRight && hasUp) {
            tileIndex = TILE_INDICES.ROAD.T_DOWN;
          } else if (hasLeft && hasRight && hasDown) {
            tileIndex = TILE_INDICES.ROAD.T_UP;
          } else if (hasLeft && hasUp) {
            tileIndex = TILE_INDICES.ROAD.CORNER_BR;
          } else if (hasRight && hasUp) {
            tileIndex = TILE_INDICES.ROAD.CORNER_BL;
          } else if (hasLeft && hasDown) {
            tileIndex = TILE_INDICES.ROAD.CORNER_TR;
          } else if (hasRight && hasDown) {
            tileIndex = TILE_INDICES.ROAD.CORNER_TL;
          } else if (hasLeft || hasRight) {
            tileIndex = getRandomTile(TILE_INDICES.ROAD.HORIZONTAL);
          } else {
            tileIndex = getRandomTile(TILE_INDICES.ROAD.VERTICAL);
          }
          
          this.layout[row][col] = {
            type: TileType.ROAD,
            tileIndex: tileIndex,
            isObstacle: false
          };
        }
      }
    }
  }

  private placeBuildings(): void {
    const buildings = [
      TILE_INDICES.BUILDINGS.HOUSE_SMALL_1,
      TILE_INDICES.BUILDINGS.HOUSE_SMALL_2,
      TILE_INDICES.BUILDINGS.HOUSE_SMALL_3,
      TILE_INDICES.BUILDINGS.SHOP_1,
      TILE_INDICES.BUILDINGS.SHOP_2,
      TILE_INDICES.BUILDINGS.OFFICE_1,
      TILE_INDICES.BUILDINGS.FACTORY_1,
      TILE_INDICES.BUILDINGS.SKYSCRAPER_1,
    ];

    // Try to place buildings in non-road areas
    for (let attempts = 0; attempts < 50; attempts++) {
      const building = buildings[Math.floor(Math.random() * buildings.length)];
      const row = Math.floor(Math.random() * (this.rows - building.height));
      const col = Math.floor(Math.random() * (this.cols - building.width));
      
      if (this.canPlaceBuilding(row, col, building.width, building.height)) {
        this.placeMultiTileBuilding(row, col, building);
      }
    }
  }

  private canPlaceBuilding(startRow: number, startCol: number, width: number, height: number): boolean {
    // Check bounds
    if (startRow + height >= this.rows || startCol + width >= this.cols) {
      return false;
    }
    
    // Check if area is clear (no roads, no existing buildings)
    for (let r = startRow; r < startRow + height; r++) {
      for (let c = startCol; c < startCol + width; c++) {
        if (this.roads[r][c] || this.layout[r][c].type !== TileType.GRASS) {
          return false;
        }
      }
    }
    
    // Check for minimum distance from roads (at least 1 tile)
    let hasNearbyRoad = false;
    for (let r = Math.max(0, startRow - 1); r <= Math.min(this.rows - 1, startRow + height); r++) {
      for (let c = Math.max(0, startCol - 1); c <= Math.min(this.cols - 1, startCol + width); c++) {
        if (this.roads[r][c]) {
          hasNearbyRoad = true;
          break;
        }
      }
      if (hasNearbyRoad) break;
    }
    
    return hasNearbyRoad; // Buildings should be near roads
  }

  private placeMultiTileBuilding(startRow: number, startCol: number, building: any): void {
    const { topLeft, width, height } = building;
    
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const tileIndex = topLeft + (r * 37) + c; // 37 is the tileset width
        
        this.layout[startRow + r][startCol + c] = {
          type: TileType.BUILDING,
          tileIndex: tileIndex,
          isObstacle: true
        };
      }
    }
  }

  private addDecorations(): void {
    const decorations = [
      TILE_INDICES.DECORATIONS.TREE_1,
      TILE_INDICES.DECORATIONS.TREE_2,
      TILE_INDICES.DECORATIONS.TREE_3,
      TILE_INDICES.DECORATIONS.BUSH_1,
      TILE_INDICES.DECORATIONS.BUSH_2,
      TILE_INDICES.DECORATIONS.FLOWER_1,
    ];

    const grassTypes = [
      TILE_INDICES.DECORATIONS.GRASS_1,
      TILE_INDICES.DECORATIONS.GRASS_2,
      TILE_INDICES.DECORATIONS.GRASS_3,
    ];

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        // Skip roads and buildings
        if (this.layout[row][col].type !== TileType.GRASS) continue;
        
        // Add decorations with some probability
        if (Math.random() < 0.2) {
          this.layout[row][col] = {
            type: TileType.TREE,
            tileIndex: decorations[Math.floor(Math.random() * decorations.length)],
            isObstacle: true
          };
        } else {
          // Use varied grass tiles
          this.layout[row][col] = {
            type: TileType.GRASS,
            tileIndex: grassTypes[Math.floor(Math.random() * grassTypes.length)],
            isObstacle: true
          };
        }
      }
    }
  }

  public getLayout(): CityTile[][] {
    return this.layout;
  }

  public getTile(row: number, col: number): CityTile | null {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      return this.layout[row][col];
    }
    return null;
  }
}