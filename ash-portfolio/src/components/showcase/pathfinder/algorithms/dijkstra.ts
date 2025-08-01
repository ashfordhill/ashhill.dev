import { Algorithm } from './algorithm';
import { Path } from '../data/Car';
import { GRID_ROWS, GRID_COLS } from '../data/Grid';

export class DijkstraAlgorithm implements Algorithm {
  name = 'Dijkstra';
  description = 'Dijkstra\'s algorithm finds the shortest path between nodes in a graph, which may represent a grid.';

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
    
    // Initialize distances array with Infinity
    const dist: number[][] = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
    dist[sr][sc] = 0;  // Distance to start is 0
    
    // Initialize visited array
    const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
    
    // Initialize parent map for path reconstruction
    const parent: { [key: string]: string | null } = {};
    parent[`${sr},${sc}`] = null;
    
    // Priority queue (simple array implementation)
    const queue: [number, number, number][] = [[sr, sc, 0]];  // [row, col, distance]
    
    // Directions for movement
    const directions: [number, number][] = [[1,0],[-1,0],[0,1],[0,-1]];
    
    while (queue.length > 0) {
      // Sort queue by distance (ascending)
      queue.sort((a, b) => a[2] - b[2]);
      
      // Get node with smallest distance
      const [r, c, d] = queue.shift()!;
      
      // If we've reached the goal, reconstruct and return the path
      if (r === gr && c === gc) {
        const path: Path = [];
        let curKey: string | null = `${r},${c}`;
        while (curKey) {
          const [cr, cc] = curKey.split(',').map(Number);
          path.unshift([cr, cc]);
          curKey = parent[curKey];
        }
        return path;
      }
      
      // Skip if already visited
      if (visited[r][c]) continue;
      
      // Mark as visited
      visited[r][c] = true;
      
      // Check all neighbors
      for (const [dr, dc] of directions) {
        const nr = r + dr, nc = c + dc;
        
        // Check if valid position
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        
        // Skip obstacles
        if (obstaclesSet.has(`${nr},${nc}`)) continue;
        
        // Skip visited nodes
        if (visited[nr][nc]) continue;
        
        // Calculate new distance (all edges have weight 1 in a grid)
        const newDist = dist[r][c] + 1;
        
        // If we found a shorter path, update distance and parent
        if (newDist < dist[nr][nc]) {
          dist[nr][nc] = newDist;
          parent[`${nr},${nc}`] = `${r},${c}`;
          
          // Add to queue
          queue.push([nr, nc, newDist]);
        }
      }
    }
    
    return null;  // No path found
  }
}