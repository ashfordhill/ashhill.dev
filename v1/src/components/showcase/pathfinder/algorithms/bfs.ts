// BFS (Breadth-First Search) pathfinding algorithm

import { Position, CellType, PathfindingOptions } from './types';

export const findPathBFS = (start: Position, end: Position, options: PathfindingOptions): Position[] => {
  const { grid, gridWidth, gridHeight } = options;
  const queue: { pos: Position; path: Position[] }[] = [{ pos: start, path: [start] }];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const { pos, path } = queue.shift()!;

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
      const key = `${neighbor.x},${neighbor.y}`;
      if (
        neighbor.x >= 0 && neighbor.x < gridWidth &&
        neighbor.y >= 0 && neighbor.y < gridHeight &&
        !visited.has(key) &&
        grid[neighbor.y][neighbor.x] !== CellType.WALL
      ) {
        visited.add(key);
        queue.push({ pos: neighbor, path: [...path, neighbor] });
      }
    }
  }

  return [];
};
