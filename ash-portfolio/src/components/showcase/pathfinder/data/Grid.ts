// Grid configuration
export const GRID_ROWS = 40;
export const GRID_COLS = 60;

export interface GridPosition {
  row: number;
  col: number;
}

export interface GridCell {
  position: GridPosition;
  isObstacle: boolean;
  isDestination: boolean;
  isSpawn: boolean;
}

export class Grid {
  private obstacles: Set<string>;
  public readonly rows: number;
  public readonly cols: number;
  public readonly destination: GridPosition;
  public readonly spawnPoints: GridPosition[];

  constructor(rows: number = GRID_ROWS, cols: number = GRID_COLS) {
    this.rows = rows;
    this.cols = cols;
    this.obstacles = new Set<string>();
    
    // Define the destination (center of rightmost column)
    this.destination = { row: Math.floor(rows / 2), col: cols - 1 };
    
    // Define spawn points (evenly distributed on leftmost column)
    this.spawnPoints = Array.from({ length: 5 }, (_, i) => ({ 
      row: i * 10 + 5, 
      col: 0 
    })).filter(pos => pos.row < rows);
  }

  // Convert position to string key for the Set
  private positionToKey(position: GridPosition): string {
    return `${position.row},${position.col}`;
  }

  // Check if a position is an obstacle
  public isObstacle(position: GridPosition): boolean {
    return this.obstacles.has(this.positionToKey(position));
  }

  // Add an obstacle at the specified position
  public addObstacle(position: GridPosition): void {
    // Don't add obstacles at spawn points or destination
    if (this.isSpawnPoint(position) || this.isDestination(position)) {
      return;
    }
    this.obstacles.add(this.positionToKey(position));
  }

  // Remove an obstacle at the specified position
  public removeObstacle(position: GridPosition): void {
    this.obstacles.delete(this.positionToKey(position));
  }

  // Get all obstacles as an array of positions
  public getObstacles(): GridPosition[] {
    return Array.from(this.obstacles).map(key => {
      const [row, col] = key.split(',').map(Number);
      return { row, col };
    });
  }

  // Get obstacles as a Set of string keys
  public getObstaclesSet(): Set<string> {
    return new Set(this.obstacles);
  }

  // Clear all obstacles
  public clearObstacles(): void {
    this.obstacles.clear();
  }

  // Check if a position is a spawn point
  public isSpawnPoint(position: GridPosition): boolean {
    return this.spawnPoints.some(
      p => p.row === position.row && p.col === position.col
    );
  }

  // Check if a position is the destination
  public isDestination(position: GridPosition): boolean {
    return position.row === this.destination.row && 
           position.col === this.destination.col;
  }

  // Check if a position is within grid bounds
  public isInBounds(position: GridPosition): boolean {
    return position.row >= 0 && position.row < this.rows &&
           position.col >= 0 && position.col < this.cols;
  }
}