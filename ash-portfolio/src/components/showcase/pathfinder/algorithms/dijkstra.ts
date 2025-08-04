// Dijkstra's pathfinding algorithm

import { Position, CellType, PathfindingOptions } from './types';

export const findPathDijkstra = (start: Position, end: Position, options: PathfindingOptions): Position[] => {
  const { grid, gridWidth, gridHeight } = options;
  const distances = new Map<string, number>();
  const previous = new Map<string, Position | null>();
  const unvisited = new Set<string>();

  // Initialize
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      if (grid[y][x] !== CellType.WALL) {
        const key = `${x},${y}`;
        distances.set(key, Infinity);
        previous.set(key, null);
        unvisited.add(key);
      }
    }
  }

  const startKey = `${start.x},${start.y}`;
  distances.set(startKey, 0);

  while (unvisited.size > 0) {
    // Find unvisited node with minimum distance
    let current: string | null = null;
    let minDistance = Infinity;
    
    const unvisitedArray = Array.from(unvisited);
    for (let i = 0; i < unvisitedArray.length; i++) {
      const node = unvisitedArray[i];
      const dist = distances.get(node) || Infinity;
      if (dist < minDistance) {
        minDistance = dist;
        current = node;
      }
    }

    if (!current || minDistance === Infinity) break;

    unvisited.delete(current);
    const coords = current.split(',');
    const x = parseInt(coords[0]);
    const y = parseInt(coords[1]);

    if (x === end.x && y === end.y) {
      // Reconstruct path
      const path: Position[] = [];
      let currentPos: Position | null = { x, y };
      
      while (currentPos) {
        path.unshift(currentPos);
        const key: string = `${currentPos.x},${currentPos.y}`;
        currentPos = previous.get(key) || null;
      }
      
      return path;
    }

    const neighbors = [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 }
    ];

    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (unvisited.has(neighborKey)) {
        const alt = (distances.get(current) || 0) + 1;
        if (alt < (distances.get(neighborKey) || Infinity)) {
          distances.set(neighborKey, alt);
          previous.set(neighborKey, { x, y });
        }
      }
    }
  }

  return [];
};
