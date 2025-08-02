import { GridPosition } from './Grid';

export type Path = [number, number][];

export interface Car {
  id: number;
  position: GridPosition;
  visualPosition: { x: number; y: number }; // For smooth interpolation
  targetPosition: GridPosition; // Where the car is moving to
  path: Path;
  pathIndex: number;
  spawnTick: number;
  moves: number;
  isFinished: boolean;
  interpolationProgress: number; // 0-1 for smooth movement
  direction: 'up' | 'down' | 'left' | 'right'; // For car sprite rotation
}

export class CarManager {
  private cars: Car[] = [];
  private totalCars: number;
  private spawnedCount: number = 0;
  private finishedCount: number = 0;
  private finishTimes: number[] = [];
  private pathLengths: number[] = [];

  constructor(totalCars: number = 100) {
    this.totalCars = totalCars;
    this.cars = [];
  }

  // Create a new car at the specified spawn point
  public createCar(spawnPosition: GridPosition, path: Path, currentTick: number): Car {
    const car: Car = {
      id: this.spawnedCount,
      position: { ...spawnPosition },
      visualPosition: { x: spawnPosition.col, y: spawnPosition.row },
      targetPosition: { ...spawnPosition },
      path: path || [[spawnPosition.row, spawnPosition.col]],
      pathIndex: 0,
      spawnTick: currentTick,
      moves: 0,
      isFinished: false,
      interpolationProgress: 1.0,
      direction: 'right'
    };
    
    this.spawnedCount++;
    this.cars.push(car);
    return car;
  }

  // Get all active cars
  public getCars(): Car[] {
    return this.cars;
  }

  // Move a car to the next position in its path
  public moveCar(car: Car): void {
    if (car.isFinished || car.pathIndex >= car.path.length - 1) {
      return;
    }
    
    const [nextRow, nextCol] = car.path[car.pathIndex + 1];
    
    // Set target position and start interpolation
    car.targetPosition = { row: nextRow, col: nextCol };
    car.interpolationProgress = 0.0;
    
    // Calculate direction for sprite rotation
    const deltaRow = nextRow - car.position.row;
    const deltaCol = nextCol - car.position.col;
    
    if (deltaRow > 0) car.direction = 'down';
    else if (deltaRow < 0) car.direction = 'up';
    else if (deltaCol > 0) car.direction = 'right';
    else if (deltaCol < 0) car.direction = 'left';
    
    // Update logical position
    car.position = { row: nextRow, col: nextCol };
    car.pathIndex++;
    car.moves++;
  }

  // Update car interpolation (called more frequently than movement)
  public updateCarInterpolation(car: Car, deltaTime: number): void {
    if (car.interpolationProgress < 1.0) {
      car.interpolationProgress = Math.min(1.0, car.interpolationProgress + deltaTime * 3.0); // Adjust speed as needed
      
      // Interpolate visual position
      const startX = car.visualPosition.x;
      const startY = car.visualPosition.y;
      const targetX = car.targetPosition.col;
      const targetY = car.targetPosition.row;
      
      car.visualPosition.x = startX + (targetX - startX) * car.interpolationProgress;
      car.visualPosition.y = startY + (targetY - startY) * car.interpolationProgress;
    }
  }

  // Mark a car as finished and record its metrics
  public finishCar(car: Car, currentTick: number): void {
    car.isFinished = true;
    this.finishedCount++;
    
    const travelTime = currentTick - car.spawnTick;
    this.finishTimes.push(travelTime);
    this.pathLengths.push(car.moves);
    
    // Remove the car from the active list
    this.cars = this.cars.filter(c => c.id !== car.id);
  }

  // Check if all cars have been spawned and finished
  public isSimulationComplete(): boolean {
    return this.spawnedCount === this.totalCars && this.cars.length === 0;
  }

  // Reset the car manager for a new simulation
  public reset(): void {
    this.cars = [];
    this.spawnedCount = 0;
    this.finishedCount = 0;
    this.finishTimes = [];
    this.pathLengths = [];
  }

  // Get simulation metrics
  public getMetrics() {
    const avgTime = this.finishTimes.length > 0 
      ? this.finishTimes.reduce((a, b) => a + b, 0) / this.finishTimes.length 
      : 0;
    
    const shortestPath = this.pathLengths.length > 0 
      ? Math.min(...this.pathLengths) 
      : 0;
    
    return {
      totalCars: this.totalCars,
      spawnedCount: this.spawnedCount,
      finishedCount: this.finishedCount,
      avgTime: Math.round(avgTime * 10) / 10,
      shortestPath
    };
  }

  // Get the number of cars that have been spawned
  public getSpawnedCount(): number {
    return this.spawnedCount;
  }

  // Get the total number of cars for this simulation
  public getTotalCars(): number {
    return this.totalCars;
  }
}