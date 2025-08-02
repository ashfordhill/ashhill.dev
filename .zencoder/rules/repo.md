---
description: Repository Information Overview
alwaysApply: true
---

# Pathfinding Visualizer Information

## Summary
A React-based web application that visualizes various pathfinding algorithms. The project is built as part of a portfolio website and includes implementations of popular algorithms like A*, BFS, DFS, and Dijkstra's algorithm.

## Structure
The repository contains a Next.js/React application with TypeScript. The main application is in the `ash-portfolio` directory, which serves as a portfolio website with a pathfinding visualizer as one of the showcase projects.

- **src/components**: Contains React components for the application
- **src/components/showcase/pathfinder**: Contains the pathfinding visualizer implementation
- **src/pages**: Next.js pages for routing
- **public**: Static assets for the application

## Language & Runtime
**Language**: TypeScript/JavaScript
**Version**: TypeScript 4.9.5
**Build System**: Next.js
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- React 19.1.1
- Next.js 15.4.5
- Material UI 7.2.0
- Pixi.js 8.11.0 (for rendering)

**Development Dependencies**:
- Testing Library (Jest, React Testing Library)
- TypeScript 4.9.5

## Build & Installation
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Testing
**Framework**: Jest with React Testing Library
**Test Location**: `src/*.test.tsx` files
**Run Command**:
```bash
npm test
```

## Pathfinding Algorithms
The application implements several pathfinding algorithms:
- **A*** (`aStar.ts`): Uses heuristics to find the shortest path
- **Breadth-First Search** (`bfs.ts`): Explores all neighbors at the present depth before moving to nodes at the next depth
- **Depth-First Search** (`dfs.ts`): Explores as far as possible along each branch before backtracking
- **Dijkstra's Algorithm** (`dijkstra.ts`): Finds the shortest path between nodes in a graph

## Application Architecture
The pathfinding visualizer is organized into several modules:
- **algorithms**: Implementation of pathfinding algorithms
- **data**: Data structures and models
- **engine**: Core logic for the pathfinding simulation
- **rendering**: Visualization components using Pixi.js
- **state**: State management for the application
- **toolbar**: UI controls for interacting with the visualization