// DFS (Depth-First Search) pathfinding algorithm

import { Position, CellType, PathfindingOptions } from './types';

export const findPathDFS = (start: Position, end: Position, options: PathfindingOptions): Position[] => {
  const { grid, gridWidth, gridHeight } = options;
  const visited = new Set<string>();
  
  const dfs = (pos: Position, path: Position[]): Position[] | null => {
    const key = `${pos.x},${pos.y}`;
    if (visited.has(key)) return null;
    visited.add(key);

    if (pos.x === end.x && pos.y === end.y) {
      return path;
    }

    const neighbors = [
      { x: pos.x + 1, y: pos.y },
      { x: pos.x - 1, y: pos.y },
      { x: pos.x, y: pos.y + 1 },
      { x: pos.x, y: pos.y - 1 }
    ];

    for (const neighbor of neighbors) {
      if (
        neighbor.x >= 0 && neighbor.x < gridWidth &&
        neighbor.y >= 0 && neighbor.y < gridHeight &&
        grid[neighbor.y][neighbor.x] !== CellType.WALL
      ) {
        const result = dfs(neighbor, [...path, neighbor]);
        if (result) return result;
      }
    }

    return null;
  };

  return dfs(start, [start]) || [];
};
