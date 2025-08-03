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

// Tile indices for different types (0-based indexing)
// Based on Kenney Roguelike Modern City 37x28 tileset (1036 tiles total)
// Adjusted indices based on typical Kenney tileset layouts
export const TILE_INDICES = {
  // Road tiles - only the ones actually used
  ROAD: {
    HORIZONTAL: [185, 186, 187, 222, 223, 224], // Horizontal road segments
    VERTICAL: [148, 185, 222, 259, 296, 333], // Vertical road segments
    INTERSECTION: [186, 223, 260, 297], // Road intersections
  },
  
  // Building tiles - only the ones actually used
  BUILDINGS: {
    HOUSE_SMALL: [0, 1, 2, 37, 38, 39], // Small residential buildings
    HOUSE_MEDIUM: [3, 4, 5, 40, 41, 42], // Medium residential buildings
    HOUSE_LARGE: [6, 7, 8, 43, 44, 45], // Large residential buildings
    OFFICE: [74, 75, 76, 111, 112, 113], // Office buildings
    SHOP: [9, 10, 11, 46, 47, 48], // Commercial buildings
    FACTORY: [12, 13, 14, 49, 50, 51], // Industrial buildings
    SKYSCRAPER: [77, 78, 79, 114, 115, 116], // Tall buildings
  },
  
  // Nature tiles - only the ones actually used
  NATURE: {
    TREE_SMALL: [370, 371, 372, 407, 408, 409], // Small trees
    TREE_LARGE: [444, 445, 446, 481, 482, 483], // Large trees
    BUSH: [518, 519, 520, 555, 556, 557], // Bushes and shrubs
    GRASS: [592, 593, 594, 629, 630, 631], // Grass variations
    ROCK: [740, 741, 742, 777, 778, 779], // Rocks and debris
  },
  
  // Special tiles - only the ones actually used
  SPECIAL: {
    CAR_RED: [814, 815, 816], // Red car sprites
    CAR_BLUE: [851, 852, 853], // Blue car sprites  
    CAR_GREEN: [888, 889, 890], // Green car sprites
    CAR_YELLOW: [925, 926, 927], // Yellow car sprites
  }
};

// Helper function to get a random tile from a category
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
}

export class CityLayoutGenerator {
  private rows: number;
  private cols: number;
  private layout: CityTile[][];

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.layout = [];
    this.generateCityLayout();
  }

  private generateCityLayout(): void {
    // Initialize with grass base
    this.layout = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, () => ({
        type: TileType.GRASS,
        tileIndex: getRandomTile(TILE_INDICES.NATURE.GRASS),
        isObstacle: false
      }))
    );

    // Create main road network first
    this.createMainRoadNetwork();
    
    // Create building districts between roads
    this.createBuildingDistricts();
    
    // Add parks and nature areas
    this.addParksAndNature();
    
    // Add some scattered obstacles for variety
    this.addScatteredObstacles();
  }

  private createMainRoadNetwork(): void {
    // Create a more organic road network with main arteries and side streets
    
    // Main horizontal roads (fewer but more strategic)
    const mainHorizontalRoads = [
      Math.floor(this.rows * 0.3),
      Math.floor(this.rows * 0.7)
    ];
    
    // Main vertical roads
    const mainVerticalRoads = [
      Math.floor(this.cols * 0.15),
      Math.floor(this.cols * 0.35),
      Math.floor(this.cols * 0.55),
      Math.floor(this.cols * 0.75)
    ];
    
    // Create main horizontal roads
    for (const roadRow of mainHorizontalRoads) {
      for (let col = 0; col < this.cols; col++) {
        this.layout[roadRow][col] = {
          type: TileType.ROAD,
          tileIndex: getRandomTile(TILE_INDICES.ROAD.HORIZONTAL),
          isObstacle: false
        };
      }
    }
    
    // Create main vertical roads
    for (const roadCol of mainVerticalRoads) {
      for (let row = 0; row < this.rows; row++) {
        this.layout[row][roadCol] = {
          type: TileType.ROAD,
          tileIndex: getRandomTile(TILE_INDICES.ROAD.VERTICAL),
          isObstacle: false
        };
      }
    }
    
    // Add intersections
    for (const roadRow of mainHorizontalRoads) {
      for (const roadCol of mainVerticalRoads) {
        this.layout[roadRow][roadCol] = {
          type: TileType.ROAD,
          tileIndex: getRandomTile(TILE_INDICES.ROAD.INTERSECTION),
          isObstacle: false
        };
      }
    }
    
    // Create spawn area connection (left side)
    const spawnRow = Math.floor(this.rows / 2);
    for (let col = 0; col < Math.floor(this.cols * 0.15); col++) {
      this.layout[spawnRow][col] = {
        type: TileType.ROAD,
        tileIndex: getRandomTile(TILE_INDICES.ROAD.HORIZONTAL),
        isObstacle: false
      };
    }
    
    // Create destination area connection (right side)
    const destRow = Math.floor(this.rows / 2);
    for (let col = Math.floor(this.cols * 0.85); col < this.cols; col++) {
      this.layout[destRow][col] = {
        type: TileType.ROAD,
        tileIndex: getRandomTile(TILE_INDICES.ROAD.HORIZONTAL),
        isObstacle: false
      };
    }
    
    // Add some connecting side streets for more path variety
    this.addSideStreets();
  }
  
  private addSideStreets(): void {
    // Add some smaller connecting roads for more navigation options
    const sideStreetRows = [
      Math.floor(this.rows * 0.15),
      Math.floor(this.rows * 0.5),
      Math.floor(this.rows * 0.85)
    ];
    
    for (const row of sideStreetRows) {
      // Create partial horizontal roads with gaps
      for (let col = 0; col < this.cols; col++) {
        if (Math.random() < 0.7) { // 70% chance for road segment
          this.layout[row][col] = {
            type: TileType.ROAD,
            tileIndex: getRandomTile(TILE_INDICES.ROAD.HORIZONTAL),
            isObstacle: false
          };
        }
      }
    }
    
    // Add some vertical connecting streets
    const sideStreetCols = [
      Math.floor(this.cols * 0.25),
      Math.floor(this.cols * 0.65)
    ];
    
    for (const col of sideStreetCols) {
      for (let row = 0; row < this.rows; row++) {
        if (Math.random() < 0.6) { // 60% chance for road segment
          this.layout[row][col] = {
            type: TileType.ROAD,
            tileIndex: getRandomTile(TILE_INDICES.ROAD.VERTICAL),
            isObstacle: false
          };
        }
      }
    }
  }

  private createBuildingDistricts(): void {
    // Create different types of districts with varying building densities
    
    // Residential areas (lower density)
    this.createResidentialDistrict(0, Math.floor(this.rows * 0.3), 0, Math.floor(this.cols * 0.4));
    this.createResidentialDistrict(Math.floor(this.rows * 0.7), this.rows, 0, Math.floor(this.cols * 0.4));
    
    // Commercial district (medium density)
    this.createCommercialDistrict(Math.floor(this.rows * 0.3), Math.floor(this.rows * 0.7), Math.floor(this.cols * 0.4), Math.floor(this.cols * 0.7));
    
    // Business district (high density)
    this.createBusinessDistrict(0, Math.floor(this.rows * 0.5), Math.floor(this.cols * 0.7), this.cols);
    
    // Mixed use area
    this.createMixedUseDistrict(Math.floor(this.rows * 0.5), this.rows, Math.floor(this.cols * 0.7), this.cols);
  }
  
  private createResidentialDistrict(startRow: number, endRow: number, startCol: number, endCol: number): void {
    const density = 0.25; // Lower density for residential
    
    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        if (this.layout[row][col].type === TileType.ROAD) continue;
        
        if (Math.random() < density) {
          const buildingTypes = [
            TILE_INDICES.BUILDINGS.HOUSE_SMALL,
            TILE_INDICES.BUILDINGS.HOUSE_MEDIUM,
            TILE_INDICES.BUILDINGS.HOUSE_LARGE,
          ];
          
          this.layout[row][col] = {
            type: TileType.BUILDING,
            tileIndex: getRandomTile(buildingTypes[Math.floor(Math.random() * buildingTypes.length)]),
            isObstacle: true
          };
        }
      }
    }
  }
  
  private createCommercialDistrict(startRow: number, endRow: number, startCol: number, endCol: number): void {
    const density = 0.35; // Medium density for commercial
    
    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        if (this.layout[row][col].type === TileType.ROAD) continue;
        
        if (Math.random() < density) {
          const buildingTypes = [
            TILE_INDICES.BUILDINGS.SHOP,
            TILE_INDICES.BUILDINGS.OFFICE,
          ];
          
          this.layout[row][col] = {
            type: TileType.BUILDING,
            tileIndex: getRandomTile(buildingTypes[Math.floor(Math.random() * buildingTypes.length)]),
            isObstacle: true
          };
        }
      }
    }
  }
  
  private createBusinessDistrict(startRow: number, endRow: number, startCol: number, endCol: number): void {
    const density = 0.45; // Higher density for business
    
    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        if (this.layout[row][col].type === TileType.ROAD) continue;
        
        if (Math.random() < density) {
          const buildingTypes = [
            TILE_INDICES.BUILDINGS.OFFICE,
            TILE_INDICES.BUILDINGS.SKYSCRAPER,
            TILE_INDICES.BUILDINGS.FACTORY,
          ];
          
          this.layout[row][col] = {
            type: TileType.BUILDING,
            tileIndex: getRandomTile(buildingTypes[Math.floor(Math.random() * buildingTypes.length)]),
            isObstacle: true
          };
        }
      }
    }
  }
  
  private createMixedUseDistrict(startRow: number, endRow: number, startCol: number, endCol: number): void {
    const density = 0.3; // Mixed density
    
    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        if (this.layout[row][col].type === TileType.ROAD) continue;
        
        if (Math.random() < density) {
          const buildingTypes = [
            TILE_INDICES.BUILDINGS.HOUSE_MEDIUM,
            TILE_INDICES.BUILDINGS.SHOP,
            TILE_INDICES.BUILDINGS.OFFICE,
          ];
          
          this.layout[row][col] = {
            type: TileType.BUILDING,
            tileIndex: getRandomTile(buildingTypes[Math.floor(Math.random() * buildingTypes.length)]),
            isObstacle: true
          };
        }
      }
    }
  }

  private addParksAndNature(): void {
    // Add small parks and green spaces
    const parkAreas = [
      { row: Math.floor(this.rows * 0.1), col: Math.floor(this.cols * 0.2), size: 3 },
      { row: Math.floor(this.rows * 0.8), col: Math.floor(this.cols * 0.6), size: 4 },
      { row: Math.floor(this.rows * 0.4), col: Math.floor(this.cols * 0.1), size: 2 },
    ];
    
    for (const park of parkAreas) {
      for (let r = park.row; r < park.row + park.size && r < this.rows; r++) {
        for (let c = park.col; c < park.col + park.size && c < this.cols; c++) {
          if (this.layout[r][c].type === TileType.ROAD) continue;
          
          const natureTypes = [
            TILE_INDICES.NATURE.TREE_SMALL,
            TILE_INDICES.NATURE.TREE_LARGE,
            TILE_INDICES.NATURE.BUSH,
            TILE_INDICES.NATURE.GRASS,
          ];
          
          this.layout[r][c] = {
            type: TileType.TREE,
            tileIndex: getRandomTile(natureTypes[Math.floor(Math.random() * natureTypes.length)]),
            isObstacle: Math.random() < 0.7 // 70% chance to be obstacle
          };
        }
      }
    }
  }
  
  private addScatteredObstacles(): void {
    // Add some random obstacles for variety (construction, debris, etc.)
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.layout[row][col].type === TileType.ROAD) continue;
        if (this.layout[row][col].isObstacle) continue;
        
        // Small chance to add scattered obstacles
        if (Math.random() < 0.05) {
          this.layout[row][col] = {
            type: TileType.BUILDING,
            tileIndex: getRandomTile(TILE_INDICES.NATURE.ROCK),
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