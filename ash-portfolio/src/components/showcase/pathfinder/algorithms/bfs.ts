import { Algorithm } from './algorithm';
import { Path } from '../data/Car';
import { GRID_ROWS, GRID_COLS } from '../data/Grid';

export class BFSAlgorithm implements Algorithm {
  name = 'BFS';
  description = 'Breadth-First Search explores all neighbors at the present depth before moving to nodes at the next depth.';

  findPath(
    start: [number, number],
    goal: [number, number],
    obstaclesSet: Set<string>
  ): Path | null {
    const [sr, sc] = start;
    const [gr, gc] = goal;
    
    // If start and goal are the same, return a path with just that position
    if (sr === gr && sc === gc) return [[sr, sc]];
    
    const rows = GRID_ROWS, cols = GRID_COLS;
    const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
    const queue: [number, number][] = [];
    const parent: { [key: string]: string | null } = {};  // to reconstruct path: key = "r,c", value = parent "r,c"
    
    // Initialize
    queue.push([sr, sc]);
    visited[sr][sc] = true;
    parent[`${sr},${sc}`] = null;
    
    // BFS loop
    const directions: [number, number][] = [[1,0],[-1,0],[0,1],[0,-1]];
    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      
      if (r === gr && c === gc) {
        // Found goal, reconstruct path
        const path: Path = [];
        let curKey: string | null = `${r},${c}`;
        while (curKey) {
          const [cr, cc] = curKey.split(',').map(Number);
          path.unshift([cr, cc]);
          curKey = parent[curKey];
        }
        return path;
      }
      
      for (let [dr, dc] of directions) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
          // not visited and within bounds
          if (obstaclesSet.has(`${nr},${nc}`)) {
            continue; // skip obstacle cells
          }
          visited[nr][nc] = true;
          parent[`${nr},${nc}`] = `${r},${c}`;
          queue.push([nr, nc]);
        }
      }
    }
    
    return null;  // no path found
  }
}