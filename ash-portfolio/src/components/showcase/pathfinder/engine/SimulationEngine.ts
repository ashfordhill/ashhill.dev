import { Grid, GridPosition } from '../data/Grid';
import { Car, CarManager, Path } from '../data/Car';
import { Algorithm } from '../algorithms/algorithm';
import { BFSAlgorithm } from '../algorithms/bfs';
import { AStarAlgorithm } from '../algorithms/aStar';
import { DFSAlgorithm } from '../algorithms/dfs';
import { DijkstraAlgorithm } from '../algorithms/dijkstra';

// Constants - optimized for better performance
const TOTAL_CARS = 20;
const TICK_INTERVAL = 200; // ms - slower for better visibility
const ANIMATION_INTERVAL = 33; // ~30fps for better performance

export interface SimulationMetrics {
  totalTime: number;
  avgTime: number;
  shortestPath: number;
}

export class SimulationEngine {
  private grid: Grid;
  private carManager: CarManager;
  private algorithm: Algorithm;
  private algorithms: Map<string, Algorithm>;
  
  private tickCount: number = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private animationId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private lastAnimationTime: number = 0;
  
  // Callbacks
  private onTick: () => void = () => {};
  private onComplete: (metrics: SimulationMetrics) => void = () => {};
  
  constructor() {
    this.grid = new Grid();
    this.carManager = new CarManager(TOTAL_CARS);
    
    // Initialize available algorithms
    this.algorithms = new Map();
    this.algorithms.set('BFS', new BFSAlgorithm());
    this.algorithms.set('DFS', new DFSAlgorithm());
    this.algorithms.set('A*', new AStarAlgorithm());
    this.algorithms.set('Dijkstra', new DijkstraAlgorithm());
    
    // Default algorithm
    this.algorithm = this.algorithms.get('BFS')!;
  }
  
  // Set callbacks
  public setOnTick(callback: () => void): void {
    this.onTick = callback;
  }
  
  public setOnComplete(callback: (metrics: SimulationMetrics) => void): void {
    this.onComplete = callback;
  }
  
  // Set the current algorithm
  public setAlgorithm(algorithmName: string): void {
    const algorithm = this.algorithms.get(algorithmName);
    if (algorithm) {
      this.algorithm = algorithm;
    }
  }
  
  // Get the current algorithm
  public getAlgorithm(): Algorithm {
    return this.algorithm;
  }
  
  // Get all available algorithms
  public getAvailableAlgorithms(): string[] {
    return Array.from(this.algorithms.keys());
  }
  
  // Start the simulation
  public start(): void {
    if (this.isRunning) {
      this.stop();
    }
    
    // Reset state
    this.tickCount = 0;
    this.carManager.reset();
    this.isRunning = true;
    this.lastAnimationTime = Date.now();
    
    // Spawn initial cars at all spawn points
    this.spawnInitialCars();
    
    // Start the simulation loop
    this.intervalId = setInterval(() => this.tick(), TICK_INTERVAL);
    
    // Start the animation loop for smooth interpolation
    this.animationId = setInterval(() => this.animate(), ANIMATION_INTERVAL);
  }
  
  // Stop the simulation
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.animationId) {
      clearInterval(this.animationId);
      this.animationId = null;
    }
    this.isRunning = false;
  }
  
  // Get the current state of the simulation
  public getState() {
    return {
      grid: this.grid,
      cars: this.carManager.getCars(),
      tickCount: this.tickCount,
      isRunning: this.isRunning
    };
  }
  
  // Add an obstacle at the specified position
  public addObstacle(position: GridPosition): void {
    this.grid.addObstacle(position);
  }
  
  // Remove an obstacle at the specified position
  public removeObstacle(position: GridPosition): void {
    this.grid.removeObstacle(position);
  }

  // Reset obstacles to predefined pattern (clear user-added obstacles)
  public resetObstacles(): void {
    this.grid.clearUserObstacles();
  }

  // Animation loop for smooth car interpolation
  private animate(): void {
    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastAnimationTime) / 1000; // Convert to seconds
    this.lastAnimationTime = currentTime;

    // Update car interpolation
    const cars = this.carManager.getCars();
    for (const car of cars) {
      this.carManager.updateCarInterpolation(car, deltaTime);
    }

    // Trigger UI update
    this.onTick();
  }
  
  // Find a path using the current algorithm
  private findPath(start: [number, number], goal: [number, number]): Path | null {
    return this.algorithm.findPath(
      start,
      goal,
      this.grid.getObstaclesSet()
    );
  }
  
  // Spawn initial cars at spawn points (one at a time)
  private spawnInitialCars(): void {
    // Only spawn one car initially to avoid congestion
    if (this.carManager.getSpawnedCount() < 1) {
      const spawnPoint = this.grid.spawnPoints[0];
      const path = this.findPath(
        [spawnPoint.row, spawnPoint.col],
        [this.grid.destination.row, this.grid.destination.col]
      );
      
      this.carManager.createCar(spawnPoint, path || [[spawnPoint.row, spawnPoint.col]], 0);
    }
  }
  
  // Simulation tick: moves cars, spawns new ones, checks for completion
  private tick(): void {
    // Increment the tick counter
    this.tickCount++;
    
    // Create a set of occupied positions
    const occupiedPositions = new Set<string>();
    this.carManager.getCars().forEach(car => {
      occupiedPositions.add(`${car.position.row},${car.position.col}`);
    });
    
    // Process each car
    const cars = [...this.carManager.getCars()];
    for (const car of cars) {
      this.processCar(car, occupiedPositions);
    }
    
    // Spawn new cars if possible
    this.spawnNewCars(occupiedPositions);
    
    // Notify listeners that a tick has occurred
    this.onTick();
    
    // Check if simulation is complete
    if (this.carManager.isSimulationComplete()) {
      this.stop();
      
      // Get metrics
      const metrics = this.carManager.getMetrics();
      this.onComplete({
        totalTime: this.tickCount,
        avgTime: metrics.avgTime,
        shortestPath: metrics.shortestPath
      });
    }
  }
  
  // Process a single car's movement
  private processCar(car: Car, occupiedPositions: Set<string>): void {
    // If car is at destination, finish it
    if (this.grid.isDestination(car.position)) {
      this.carManager.finishCar(car, this.tickCount);
      occupiedPositions.delete(`${car.position.row},${car.position.col}`);
      return;
    }
    
    // Determine next position
    if (car.pathIndex < car.path.length - 1) {
      const [nextRow, nextCol] = car.path[car.pathIndex + 1];
      
      // If next position has an obstacle, recalculate path
      if (this.grid.isObstacle({ row: nextRow, col: nextCol })) {
        car.path = this.findPath(
          [car.position.row, car.position.col],
          [this.grid.destination.row, this.grid.destination.col]
        ) || [[car.position.row, car.position.col]];
        car.pathIndex = 0;
      }
      
      // Get the next position after potential recalculation
      if (car.pathIndex < car.path.length - 1) {
        const [nextRow, nextCol] = car.path[car.pathIndex + 1];
        const nextPosition = { row: nextRow, col: nextCol };
        const nextPositionKey = `${nextPosition.row},${nextPosition.col}`;
        
        // If next position is free, move the car
        if (!occupiedPositions.has(nextPositionKey)) {
          // Update occupancy
          occupiedPositions.delete(`${car.position.row},${car.position.col}`);
          occupiedPositions.add(nextPositionKey);
          
          // Move the car
          this.carManager.moveCar(car);
          
          // If car reached destination, finish it
          if (this.grid.isDestination(car.position)) {
            this.carManager.finishCar(car, this.tickCount);
            occupiedPositions.delete(`${car.position.row},${car.position.col}`);
          }
        }
      }
    }
  }
  
  // Spawn new cars at available spawn points (controlled rate)
  private spawnNewCars(occupiedPositions: Set<string>): void {
    if (this.carManager.getSpawnedCount() < this.carManager.getTotalCars()) {
      // Only spawn a new car every 10 ticks to avoid congestion
      if (this.tickCount % 10 === 0) {
        // Try to spawn at a random available spawn point
        const availableSpawnPoints = this.grid.spawnPoints.filter(spawnPoint => {
          const spawnPointKey = `${spawnPoint.row},${spawnPoint.col}`;
          return !occupiedPositions.has(spawnPointKey);
        });
        
        if (availableSpawnPoints.length > 0) {
          const randomSpawnPoint = availableSpawnPoints[Math.floor(Math.random() * availableSpawnPoints.length)];
          const path = this.findPath(
            [randomSpawnPoint.row, randomSpawnPoint.col],
            [this.grid.destination.row, this.grid.destination.col]
          );
          
          this.carManager.createCar(randomSpawnPoint, path || [[randomSpawnPoint.row, randomSpawnPoint.col]], this.tickCount);
          occupiedPositions.add(`${randomSpawnPoint.row},${randomSpawnPoint.col}`);
        }
      }
    }
  }
}