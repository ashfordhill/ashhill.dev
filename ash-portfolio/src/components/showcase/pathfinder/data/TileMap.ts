// Tile mapping for Kenney Pico City tileset
// Based on the 24x15 grid (360 tiles total)

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
// Based on Kenney Pico City 24x15 tileset (360 tiles total)
export const TILE_INDICES = {
  // Road tiles - gray asphalt roads (based on actual tileset)
  ROAD: {
    HORIZONTAL: [96, 97, 98], // Horizontal road segments
    VERTICAL: [120, 144, 168], // Vertical road segments  
    INTERSECTION: [121, 122, 123], // Road intersections
    CORNER_TL: [145], // Top-left corner
    CORNER_TR: [146], // Top-right corner
    CORNER_BL: [169], // Bottom-left corner
    CORNER_BR: [170], // Bottom-right corner
    T_JUNCTION_UP: [147], // T-junction facing up
    T_JUNCTION_DOWN: [171], // T-junction facing down
    T_JUNCTION_LEFT: [148], // T-junction facing left
    T_JUNCTION_RIGHT: [172], // T-junction facing right
  },
  
  // Building tiles - colorful city buildings
  BUILDINGS: {
    HOUSE_SMALL: [24, 25, 48, 49], // Small houses
    HOUSE_MEDIUM: [26, 27, 50, 51], // Medium houses
    HOUSE_LARGE: [28, 29, 52, 53], // Large houses
    OFFICE: [30, 31, 54, 55], // Office buildings
    SHOP: [32, 33, 56, 57], // Shops
    FACTORY: [34, 35, 58, 59], // Industrial buildings
  },
  
  // Nature tiles - grass, trees, water
  NATURE: {
    TREE_SMALL: [0, 1, 2], // Small trees
    TREE_LARGE: [3, 4, 5], // Large trees
    BUSH: [6, 7, 8], // Bushes
    GRASS: [72, 73, 74, 75], // Grass variations
    WATER: [192, 193, 194, 195], // Water tiles
    ROCK: [9, 10, 11], // Rocks
  },
  
  // Special tiles
  SPECIAL: {
    SPAWN_POINT: [216, 217], // Spawn point markers
    DESTINATION: [240, 241], // Destination markers
    CAR_RED: [264, 265], // Red car sprites
    CAR_BLUE: [266, 267], // Blue car sprites
    CAR_GREEN: [268, 269], // Green car sprites
    CAR_YELLOW: [270, 271], // Yellow car sprites
  }
};

// Helper function to get a random tile from a category
export function getRandomTile(tileArray: number[]): number {
  return tileArray[Math.floor(Math.random() * tileArray.length)];
}

// Helper function to get tile path
export function getTilePath(tileIndex: number): string {
  const paddedIndex = tileIndex.toString().padStart(4, '0');
  return `/assets/kenney-pico-city/Tiles/tile_${paddedIndex}.png`;
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
    // Initialize with obstacles (buildings) - everything starts as non-road
    this.layout = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, () => ({
        type: TileType.BUILDING,
        tileIndex: getRandomTile(TILE_INDICES.BUILDINGS.HOUSE_SMALL),
        isObstacle: true
      }))
    );

    // Create boundary obstacles (walls around the entire map)
    this.createBoundaryWalls();
    
    // Create main roads (horizontal and vertical arteries)
    this.createMainRoads();
    
    // Create building clusters between roads
    this.createBuildingClusters();
    
    // Add some nature elements
    this.addNatureElements();
  }

  private createBoundaryWalls(): void {
    // Create walls around the entire perimeter (except spawn and destination areas)
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        // Top and bottom walls
        if (row === 0 || row === this.rows - 1) {
          this.layout[row][col] = {
            type: TileType.BUILDING,
            tileIndex: getRandomTile(TILE_INDICES.BUILDINGS.FACTORY),
            isObstacle: true
          };
        }
        // Left wall (except spawn area)
        else if (col === 0 && (row < 5 || row > this.rows - 6)) {
          this.layout[row][col] = {
            type: TileType.BUILDING,
            tileIndex: getRandomTile(TILE_INDICES.BUILDINGS.FACTORY),
            isObstacle: true
          };
        }
        // Right wall (except destination area)
        else if (col === this.cols - 1 && (row < Math.floor(this.rows / 2) - 2 || row > Math.floor(this.rows / 2) + 2)) {
          this.layout[row][col] = {
            type: TileType.BUILDING,
            tileIndex: getRandomTile(TILE_INDICES.BUILDINGS.FACTORY),
            isObstacle: true
          };
        }
      }
    }
  }

  private createMainRoads(): void {
    // Create horizontal roads with better spacing
    const horizontalRoads = [
      Math.floor(this.rows * 0.25), 
      Math.floor(this.rows * 0.5),
      Math.floor(this.rows * 0.75)
    ];
    
    for (const roadRow of horizontalRoads) {
      for (let col = 1; col < this.cols - 1; col++) {
        this.layout[roadRow][col] = {
          type: TileType.ROAD,
          tileIndex: getRandomTile(TILE_INDICES.ROAD.HORIZONTAL),
          isObstacle: false
        };
      }
    }

    // Create vertical main roads
    const verticalRoads = [
      Math.floor(this.cols * 0.2), 
      Math.floor(this.cols * 0.4),
      Math.floor(this.cols * 0.6),
      Math.floor(this.cols * 0.8)
    ];
    
    for (const roadCol of verticalRoads) {
      for (let row = 1; row < this.rows - 1; row++) {
        this.layout[row][roadCol] = {
          type: TileType.ROAD,
          tileIndex: getRandomTile(TILE_INDICES.ROAD.VERTICAL),
          isObstacle: false
        };
      }
    }

    // Add intersections where roads cross
    for (const roadRow of horizontalRoads) {
      for (const roadCol of verticalRoads) {
        this.layout[roadRow][roadCol] = {
          type: TileType.ROAD,
          tileIndex: getRandomTile(TILE_INDICES.ROAD.INTERSECTION),
          isObstacle: false
        };
      }
    }

    // Create spawn area roads (left side)
    for (let row = 5; row < this.rows - 5; row++) {
      for (let col = 0; col < Math.floor(this.cols * 0.2); col++) {
        this.layout[row][col] = {
          type: TileType.ROAD,
          tileIndex: getRandomTile(TILE_INDICES.ROAD.HORIZONTAL),
          isObstacle: false
        };
      }
    }

    // Create destination area roads (right side)
    const destRow = Math.floor(this.rows / 2);
    for (let row = destRow - 2; row <= destRow + 2; row++) {
      for (let col = Math.floor(this.cols * 0.8); col < this.cols; col++) {
        this.layout[row][col] = {
          type: TileType.ROAD,
          tileIndex: getRandomTile(TILE_INDICES.ROAD.HORIZONTAL),
          isObstacle: false
        };
      }
    }
  }

  private createBuildingClusters(): void {
    // Define building zones (areas between main roads)
    const zones = [
      { startRow: 0, endRow: Math.floor(this.rows * 0.25), startCol: 0, endCol: Math.floor(this.cols * 0.2) },
      { startRow: 0, endRow: Math.floor(this.rows * 0.25), startCol: Math.floor(this.cols * 0.2), endCol: Math.floor(this.cols * 0.5) },
      { startRow: 0, endRow: Math.floor(this.rows * 0.25), startCol: Math.floor(this.cols * 0.5), endCol: Math.floor(this.cols * 0.8) },
      { startRow: 0, endRow: Math.floor(this.rows * 0.25), startCol: Math.floor(this.cols * 0.8), endCol: this.cols },
      
      { startRow: Math.floor(this.rows * 0.25), endRow: Math.floor(this.rows * 0.75), startCol: 0, endCol: Math.floor(this.cols * 0.2) },
      { startRow: Math.floor(this.rows * 0.25), endRow: Math.floor(this.rows * 0.75), startCol: Math.floor(this.cols * 0.2), endCol: Math.floor(this.cols * 0.5) },
      { startRow: Math.floor(this.rows * 0.25), endRow: Math.floor(this.rows * 0.75), startCol: Math.floor(this.cols * 0.5), endCol: Math.floor(this.cols * 0.8) },
      { startRow: Math.floor(this.rows * 0.25), endRow: Math.floor(this.rows * 0.75), startCol: Math.floor(this.cols * 0.8), endCol: this.cols },
      
      { startRow: Math.floor(this.rows * 0.75), endRow: this.rows, startCol: 0, endCol: Math.floor(this.cols * 0.2) },
      { startRow: Math.floor(this.rows * 0.75), endRow: this.rows, startCol: Math.floor(this.cols * 0.2), endCol: Math.floor(this.cols * 0.5) },
      { startRow: Math.floor(this.rows * 0.75), endRow: this.rows, startCol: Math.floor(this.cols * 0.5), endCol: Math.floor(this.cols * 0.8) },
      { startRow: Math.floor(this.rows * 0.75), endRow: this.rows, startCol: Math.floor(this.cols * 0.8), endCol: this.cols },
    ];

    // Fill each zone with buildings (leaving some space for roads)
    for (const zone of zones) {
      this.fillZoneWithBuildings(zone);
    }
  }

  private fillZoneWithBuildings(zone: { startRow: number; endRow: number; startCol: number; endCol: number }): void {
    const buildingDensity = 0.3; // 30% of the zone will have buildings (reduced for better navigation)
    
    for (let row = zone.startRow; row < zone.endRow; row++) {
      for (let col = zone.startCol; col < zone.endCol; col++) {
        // Skip if it's already a road
        if (this.layout[row][col].type === TileType.ROAD) continue;
        
        // Randomly place buildings based on density
        if (Math.random() < buildingDensity) {
          const buildingTypes = [
            TILE_INDICES.BUILDINGS.HOUSE_SMALL,
            TILE_INDICES.BUILDINGS.HOUSE_MEDIUM,
            TILE_INDICES.BUILDINGS.HOUSE_LARGE,
            TILE_INDICES.BUILDINGS.OFFICE,
            TILE_INDICES.BUILDINGS.SHOP,
          ];
          
          const selectedBuildingType = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
          
          this.layout[row][col] = {
            type: TileType.BUILDING,
            tileIndex: getRandomTile(selectedBuildingType),
            isObstacle: true
          };
        }
      }
    }
  }

  private addNatureElements(): void {
    // Add some trees and nature elements in empty spaces
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.layout[row][col].type === TileType.GRASS && Math.random() < 0.1) {
          const natureTypes = [
            TILE_INDICES.NATURE.TREE_SMALL,
            TILE_INDICES.NATURE.TREE_LARGE,
            TILE_INDICES.NATURE.BUSH,
          ];
          
          const selectedNatureType = natureTypes[Math.floor(Math.random() * natureTypes.length)];
          
          this.layout[row][col] = {
            type: TileType.TREE,
            tileIndex: getRandomTile(selectedNatureType),
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