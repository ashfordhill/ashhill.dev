import { Algorithm } from './algorithm';
import { Path } from '../data/Car';

export class AStarAlgorithm implements Algorithm {
  name = 'A*';
  description = 'A* uses heuristics to find the shortest path by prioritizing paths that seem to be leading closer to the goal.';

  findPath(
    start: [number, number],
    goal: [number, number],
    obstaclesSet: Set<string>,
    gridRows: number = 50,
    gridCols: number = 50
  ): Path | null {
    const [sr, sc] = start;
    const [gr, gc] = goal;
    
    // If start and goal are the same, return a path with just that position
    if (sr === gr && sc === gc) return [[sr, sc]];
    
    const rows = gridRows, cols = gridCols;
    const closed = Array.from({ length: rows }, () => Array(cols).fill(false));
    const gScore = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
    const fScore = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
    const parent: { [key: string]: string | null } = {};  // to reconstruct path: key = "r,c", value = parent "r,c"
    
    // Priority queue for open set (min-heap based on fScore)
    const openHeap: [number, number, number][] = [];
    
    function push(node: [number, number], f: number) {
      // insert node in openHeap sorted by fScore
      let i = 0;
      while (i < openHeap.length && openHeap[i][2] <= f) i++;
      openHeap.splice(i, 0, [node[0], node[1], f]);  // insert at position i
    }
    
    function pop(): [number, number, number] {
      return openHeap.shift()!;
    }
    
    // Heuristic: Manhattan distance
    const heuristic = (r: number, c: number) => Math.abs(r - gr) + Math.abs(c - gc);

    // initialize start
    gScore[sr][sc] = 0;
    fScore[sr][sc] = heuristic(sr, sc);
    push([sr, sc], fScore[sr][sc]);
    parent[`${sr},${sc}`] = null;

    const directions = [[1,0],[-1,0],[0,1],[0,-1]];
    while (openHeap.length > 0) {
      const [cr, cc] = pop();  // node with smallest fScore
      
      if (cr === gr && cc === gc) {
        // reconstruct path
        const path: Path = [];
        let curKey: string | null = `${cr},${cc}`;
        while (curKey) {
          const [pr, pc] = curKey.split(',').map(Number);
          path.unshift([pr, pc]);
          curKey = parent[curKey];
        }
        return path;
      }
      
      if (closed[cr][cc]) continue;
      closed[cr][cc] = true;
      
      // explore neighbors
      for (let [dr, dc] of directions) {
        const nr = cr + dr, nc = cc + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        if (obstaclesSet.has(`${nr},${nc}`)) continue;  // cannot pass obstacles
        if (closed[nr][nc]) continue;
        
        const tentativeG = gScore[cr][cc] + 1;
        if (tentativeG < gScore[nr][nc]) {
          parent[`${nr},${nc}`] = `${cr},${cc}`;
          gScore[nr][nc] = tentativeG;
          fScore[nr][nc] = tentativeG + heuristic(nr, nc);
          push([nr, nc], fScore[nr][nc]);
        }
      }
    }
    
    return null;  // no path found
  }
}