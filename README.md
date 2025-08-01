# Puppeteer Screenshot

![Screenshot of UI screen](./ash-portfolio/screenshot.png)

# Pathfinding Visualizer

A React-based web application that visualizes various pathfinding algorithms. This project demonstrates how different algorithms like A*, BFS, DFS, and Dijkstra's algorithm find paths in a grid-based environment.

## Features

- Interactive grid where you can add and remove obstacles
- Multiple pathfinding algorithms:
  - Breadth-First Search (BFS)
  - A* Search
  - Depth-First Search (DFS)
  - Dijkstra's Algorithm
- Real-time visualization of algorithm execution
- Performance metrics for comparing algorithms

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pathfinding-visualizer.git
   cd pathfinding-visualizer
   ```

2. Install dependencies:
   ```bash
   cd ash-portfolio
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Taking Screenshots

This repository includes a GitHub Actions workflow that automatically:
- Runs the application
- Takes screenshots using Puppeteer
- Generates a GIF showing the progress over time
- Updates this README with the latest GIF

To manually take a screenshot locally:

1. Install dependencies in the root directory:
   ```bash
   npm install
   ```

2. Run the screenshot script:
   ```bash
   npm run screenshot
   ```

## Pathfinder Progress

![Pathfinder Progress](images/pathfinder-progress.gif)