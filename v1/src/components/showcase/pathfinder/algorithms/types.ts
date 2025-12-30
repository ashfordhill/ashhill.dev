// Types shared across pathfinding algorithms

export interface Position {
  x: number;
  y: number;
}

export enum CellType {
  WALL = 0,
  PATH = 1,
  SPAWN = 2,
  TARGET = 3
}

export type Algorithm = 'BFS' | 'DFS' | 'A*' | 'Dijkstra';

export interface PathfindingOptions {
  grid: CellType[][];
  gridWidth: number;
  gridHeight: number;
}

export type PathfindingFunction = (start: Position, end: Position, options: PathfindingOptions) => Position[];
