// A* pathfinding algorithm

import { Position, CellType, PathfindingOptions } from './types';

export const findPathAStar = (start: Position, end: Position, options: PathfindingOptions): Position[] => {
  const { grid, gridWidth, gridHeight } = options;
  const openSet: { pos: Position; path: Position[]; f: number; g: number }[] = [];
  const closedSet = new Set<string>();
  
  const heuristic = (a: Position, b: Position) => 
    Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

  openSet.push({ pos: start, path: [start], f: heuristic(start, end), g: 0 });

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;
    const key = `${current.pos.x},${current.pos.y}`;

    if (closedSet.has(key)) continue;
    closedSet.add(key);

    if (current.pos.x === end.x && current.pos.y === end.y) {
      return current.path;
    }

    const neighbors = [
      { x: current.pos.x + 1, y: current.pos.y },
      { x: current.pos.x - 1, y: current.pos.y },
      { x: current.pos.x, y: current.pos.y + 1 },
      { x: current.pos.x, y: current.pos.y - 1 }
    ];

    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (
        neighbor.x >= 0 && neighbor.x < gridWidth &&
        neighbor.y >= 0 && neighbor.y < gridHeight &&
        !closedSet.has(neighborKey) &&
        grid[neighbor.y][neighbor.x] !== CellType.WALL
      ) {
        const g = current.g + 1;
        const h = heuristic(neighbor, end);
        const f = g + h;
        
        openSet.push({ 
          pos: neighbor, 
          path: [...current.path, neighbor], 
          f, 
          g 
        });
      }
    }
  }

  return [];
};
