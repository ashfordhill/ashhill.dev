// Main pathfinding algorithms index

import { Algorithm, PathfindingFunction } from './types';
import { findPathBFS } from './bfs';
import { findPathDFS } from './dfs';
import { findPathAStar } from './aStar';
import { findPathDijkstra } from './dijkstra';

export * from './types';

// Algorithm display names
export const ALGORITHM_NAMES: Record<Algorithm, string> = {
  'BFS': 'BFS',
  'DFS': 'DFS',
  'A*': 'A*',
  'Dijkstra': 'Dijkstra'
};

// Get pathfinding function based on algorithm
export const getPathfindingFunction = (algorithm: Algorithm): PathfindingFunction => {
  switch (algorithm) {
    case 'BFS': return findPathBFS;
    case 'DFS': return findPathDFS;
    case 'A*': return findPathAStar;
    case 'Dijkstra': return findPathDijkstra;
    default: return findPathBFS;
  }
};
