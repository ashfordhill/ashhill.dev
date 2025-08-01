import { Algorithm } from './algorithm';
import { Path } from '../data/Car';
import { GRID_ROWS, GRID_COLS } from '../data/Grid';

export class DFSAlgorithm implements Algorithm {
  name = 'DFS';
  description = 'Depth-First Search explores as far as possible along each branch before backtracking.';

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
    const parent: { [key: string]: string | null } = {};  // to reconstruct path: key = "r,c", value = parent "r,c"
    
    // Initialize
    parent[`${sr},${sc}`] = null;
    
    // DFS using recursion
    const found = this.dfsRecursive(sr, sc, gr, gc, visited, parent, obstaclesSet);
    
    if (found) {
      // Reconstruct path
      const path: Path = [];
      let curKey: string | null = `${gr},${gc}`;
      while (curKey) {
        const [cr, cc] = curKey.split(',').map(Number);
        path.unshift([cr, cc]);
        curKey = parent[curKey];
      }
      return path;
    }
    
    return null;  // no path found
  }
  
  private dfsRecursive(
    r: number, 
    c: number, 
    gr: number, 
    gc: number, 
    visited: boolean[][], 
    parent: { [key: string]: string | null },
    obstaclesSet: Set<string>
  ): boolean {
    // Mark current cell as visited
    visited[r][c] = true;
    
    // If we've reached the goal, return true
    if (r === gr && c === gc) {
      return true;
    }
    
    // Explore all four directions
    const directions: [number, number][] = [[1,0],[-1,0],[0,1],[0,-1]];
    for (let [dr, dc] of directions) {
      const nr = r + dr, nc = c + dc;
      
      // Check if the new position is valid
      if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS && 
          !visited[nr][nc] && !obstaclesSet.has(`${nr},${nc}`)) {
        
        // Set parent for this cell
        parent[`${nr},${nc}`] = `${r},${c}`;
        
        // Recursively explore this path
        if (this.dfsRecursive(nr, nc, gr, gc, visited, parent, obstaclesSet)) {
          return true;
        }
      }
    }
    
    return false;  // No path found from this cell
  }
}