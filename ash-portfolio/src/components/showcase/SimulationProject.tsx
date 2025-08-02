import React, { useState, useEffect, useRef } from 'react';
import { ToggleButton, ToggleButtonGroup, Tooltip, IconButton, Box, Paper, Typography } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Star as StarIcon, DirectionsCar as CarIcon } from '@mui/icons-material';

// Grid configuration (can be adjusted or made configurable)
const GRID_ROWS = 40;
const GRID_COLS = 60;
// Number of cars per simulation run (total cars that will spawn)
const TOTAL_CARS = 100;
// Define the spawn points (row indices on the leftmost column where cars appear)
const SPAWN_POINTS = Array.from({ length: 5 }, (_, i) => i * 10 + 5)
  .filter(r => r < GRID_ROWS);
const DESTINATION = { row: Math.floor(GRID_ROWS/2), col: GRID_COLS - 1 };   // destination on rightmost column (e.g. center row)

// Helper function: Breadth-First Search for shortest path on grid (4-directional moves)
interface GridPosition {
    row: number;
    col: number;
}

type Path = [number, number][];

function bfsPath(
    start: [number, number],
    goal: [number, number],
    obstaclesSet: Set<string>
): Path | null {
    const [sr, sc] = start;
    const [gr, gc] = goal;
    if (sr === gr && sc === gc) return [[sr, sc]];  // already at goal
    const rows = GRID_ROWS, cols = GRID_COLS;
    const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
    const queue: [number, number][] = [];
    const parent: { [key: string]: string | null } = {};  // to reconstruct path: key = "r,c", value = parent "r,c"
    // Initialize
    queue.push([sr, sc]);
    console.log({ sr, sc, rows, cols, visitedLength: visited.length, visitedRowLength: visited[0]?.length });
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

// Helper function: A* search for shortest path using Manhattan distance heuristic
function aStarPath(start: [number, number], goal: [number, number], obstaclesSet: Set<String>) {
  const [sr, sc] = start;
  const [gr, gc] = goal;
  if (sr === gr && sc === gc) return [[sr, sc]];
  const rows = GRID_ROWS, cols = GRID_COLS;
  const closed = Array.from({ length: rows }, () => Array(cols).fill(false));
  const gScore = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const fScore = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const parent: { [key: string]: string | null } = {};  // to reconstruct path: key = "r,c", value = parent "r,c"
  // Priority queue for open set (min-heap based on fScore)
  const openHeap: any[] = [];
  function push(node: any[], f: number) {
    // insert node in openHeap sorted by fScore
    let i = 0;
    while (i < openHeap.length && openHeap[i][2] <= f) i++;
    openHeap.splice(i, 0, node);  // insert at position i
  }
  function pop() {
    return openHeap.shift();
  }
  // Heuristic: Manhattan distance
  const heuristic = (r: number, c: number) => Math.abs(r - gr) + Math.abs(c - gc);

  // initialize start
  gScore[sr][sc] = 0;
  fScore[sr][sc] = heuristic(sr, sc);
  push([sr, sc, fScore[sr][sc]], fScore[sr][sc]);
  parent[`${sr},${sc}`] = null;

  const directions = [[1,0],[-1,0],[0,1],[0,-1]];
  while (openHeap.length > 0) {
    const [cr, cc, fcurr] = pop();  // node with smallest fScore
    if (cr === gr && cc === gc) {
      // reconstruct path
      const path = [];
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
        push([nr, nc, fScore[nr][nc]], fScore[nr][nc]);
      }
    }
  }
  return null;
}

function PathfindingSimulation() {
  // State for obstacle layout: using a Set of "r,c" strings for occupied obstacle cells
  const [obstacles, setObstacles] = useState<Set<string>>(new Set());
  // State for cars: an array of car objects
  const [cars, setCars] = useState<any>([]);
  // Pathfinding algorithm selection (e.g., "BFS" or "A*")
  const [algorithm, setAlgorithm] = useState("BFS");
  // Obstacle tool mode ("add" or "remove")
  const [tool, setTool] = useState("add");
  // Metrics and simulation control
  const [showMetrics, setShowMetrics] = useState(false);
  const [metrics, setMetrics] = useState({ totalTime: 0, avgTime: 0, shortestPath: 0 });

  // Refs for simulation loop management
  const intervalRef = useRef<any>(undefined);
  const tickCountRef = useRef(0);
  const spawnCounterRef = useRef(0);
  const finishedCountRef = useRef(0);
  // We will collect stats for each finished car to compute metrics
  const finishTimesRef = useRef<any[]>([]);   // store travel times (finishTick - spawnTick) for each car
  const pathLengthsRef = useRef<any[]>([]);   // store number of moves for each car

  // Function to compute a path according to current algorithm
  const findPath = (start: any, goal: any) => {
    if (algorithm === "BFS") {
      return bfsPath(start, goal, obstacles);
    } else if (algorithm === "A*") {
      return aStarPath(start, goal, obstacles);
    }
    return bfsPath(start, goal, obstacles);  // default to BFS if unknown
  };

  // Initialize a new simulation run
  const startSimulation = () => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Reset simulation state
    tickCountRef.current = 0;
    spawnCounterRef.current = 0;
    finishedCountRef.current = 0;
    finishTimesRef.current = [];
    pathLengthsRef.current = [];
    setShowMetrics(false);
    setCars([]);  // no cars initially
    // Spawn initial cars at all spawn points (one per spawn) to start
    const initialCars: any[] = [];
    for (let r of SPAWN_POINTS) {
      if (spawnCounterRef.current < TOTAL_CARS) {
        // Spawn a new car at (r, 0)
        const carId = spawnCounterRef.current;
        spawnCounterRef.current += 1;
        const startPos = { row: r, col: 0 };
        const path = findPath([r, 0], [DESTINATION.row, DESTINATION.col]);
        const carObj = {
          id: carId,
          row: r,
          col: 0,
          path: path || [[r, 0]],   // if no path found (should not happen unless blocked), just stay at start
          pathIndex: 0,            // current position index in path
          spawnTick: 0,
          moves: 0
        };
        initialCars.push(carObj);
      }
    }
    setCars(initialCars);

    // Start the simulation loop interval
    intervalRef.current = setInterval(simulationTick, 100);  // e.g. 100ms per tick (~10 frames/sec)
  };

  // Stop the simulation loop
  const stopSimulation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Simulation tick: moves cars, spawns new ones, checks for completion
  const simulationTick = () => {
    // Increment the discrete time step counter
    tickCountRef.current += 1;
    // We will build the next state of the cars array
    let newCarsList = [];
    // Create a set for current occupancy (cells occupied by cars at start of tick)
    const occupancy = new Set(cars.map((car: { row: any; col: any; }) => `${car.row},${car.col}`));

    // Move each car in order
    let finishedThisTick = [];  // to collect cars that reach destination in this tick
    for (let car of cars) {
      // If this car already finished (should have been removed), skip (not expected in list).
      // Determine next cell on path
      let nextCell = null;
      if (car.pathIndex < car.path.length - 1) {
        // Next step in precomputed path
        const [nr, nc] = car.path[car.pathIndex + 1];
        // If a new obstacle was placed on this next cell, we need to recalc path
        if (obstacles.has(`${nr},${nc}`)) {
          // Recompute path from current position
          car.path = findPath([car.row, car.col], [DESTINATION.row, DESTINATION.col]) || [[car.row, car.col]];
          car.pathIndex = 0;
        }
        // Now set nextCell after potential path adjustment
        if (car.pathIndex < car.path.length - 1) {
          nextCell = { row: car.path[car.pathIndex + 1][0], col: car.path[car.pathIndex + 1][1] };
        } else {
          nextCell = null;
        }
      }
      if (!nextCell) {
        // No next cell means car is at destination (should be handled when arrived, so normally skip)
        continue;
      }
      // Check if next cell is the destination
      if (nextCell.row === DESTINATION.row && nextCell.col === DESTINATION.col) {
        // Destination reached; check if it's free (should be, as only one car can finish at a time)
        if (!occupancy.has(`${nextCell.row},${nextCell.col}`)) {
          // Move into destination
          car.row = nextCell.row;
          car.col = nextCell.col;
          car.pathIndex += 1;
          car.moves += 1;
          // Mark this car as finished
          finishedThisTick.push(car);
          finishedCountRef.current += 1;
          // Record metrics for this car
          const travelTime = tickCountRef.current - car.spawnTick;
          finishTimesRef.current.push(travelTime);
          pathLengthsRef.current.push(car.moves);
          // Update occupancy: remove old pos, do not add destination since car leaves immediately
          occupancy.delete(`${car.row},${car.col}`);  // (old position before update)
          // We do NOT add dest to occupancy because the car is gone.
        } else {
          // Destination cell is occupied (another car finishing this tick), so wait
          // (In practice, we avoid this by removing cars immediately, so this branch may not occur)
          // Car stays in place (no position change, no path index increment)
          newCarsList.push(car);
        }
      } else {
        // Next cell is a regular road cell
        const nextKey = `${nextCell.row},${nextCell.col}`;
        if (!occupancy.has(nextKey)) {
          // The next cell is free – this car can move
          // Update occupancy: remove current, add next
          occupancy.delete(`${car.row},${car.col}`);
          occupancy.add(nextKey);
          // Update car's position and path index
          car.row = nextCell.row;
          car.col = nextCell.col;
          car.pathIndex += 1;
          car.moves += 1;
          // Add this car to the new list (still active)
          newCarsList.push(car);
        } else {
          // Next cell is occupied by another car that didn't move this tick, so this car waits
          // (No changes to position or pathIndex)
          newCarsList.push(car);
        }
      }
    }

    // Spawn new cars (one per free spawn point) if we still have cars left to spawn
    if (spawnCounterRef.current < TOTAL_CARS) {
      for (let r of SPAWN_POINTS) {
        if (spawnCounterRef.current >= TOTAL_CARS) break;
        const spawnKey = `${r},0`;
        if (!occupancy.has(spawnKey)) {
          // Spawn a new car at this spawn point
          const carId = spawnCounterRef.current;
          spawnCounterRef.current += 1;
          const startPos = { row: r, col: 0 };
          const path = findPath([r, 0], [DESTINATION.row, DESTINATION.col]);
          const newCar = {
            id: carId,
            row: r,
            col: 0,
            path: path || [[r, 0]],
            pathIndex: 0,
            spawnTick: tickCountRef.current,  // record spawn time (current tick)
            moves: 0
          };
          newCarsList.push(newCar);
          occupancy.add(spawnKey);
        }
      }
    }

    // Update the cars state for next tick
    setCars(newCarsList);

    // Check for simulation end: all cars spawned and none left on grid
    if (spawnCounterRef.current === TOTAL_CARS && newCarsList.length === 0) {
      // All cars have finished this run
      stopSimulation();  // stop the interval loop
      // Compute metrics
      const totalTime = tickCountRef.current;
      const avgTime = finishTimesRef.current.length ? 
                      (finishTimesRef.current.reduce((a,b) => a + b, 0) / finishTimesRef.current.length) : 0;
      const shortestPath = pathLengthsRef.current.length ? Math.min(...pathLengthsRef.current) : 0;
      setMetrics({
        totalTime: totalTime,
        avgTime: Math.round(avgTime * 10) / 10,    // rounded to one decimal
        shortestPath: shortestPath
      });
      setShowMetrics(true);
      // After a brief pause, restart the simulation automatically (with same algorithm)
      setTimeout(() => {
        if (intervalRef.current) return;  // if a new sim already started (e.g. algorithm changed), do nothing
        setShowMetrics(false);
        startSimulation();
      }, 3000);  // show metrics for 3 seconds
    }
  };

  // Effect: start simulation on initial mount and whenever algorithm changes
  useEffect(() => {
    // Start a new simulation run with the current algorithm
    startSimulation();
    // Cleanup on unmount: ensure interval is cleared
    return () => {
      stopSimulation();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithm]);  // re-run when algorithm changes

  // Handler for algorithm toggle
  const handleAlgorithmChange = (event: any, newAlg: React.SetStateAction<string>) => {
    if (!newAlg || newAlg === algorithm) return;
    // If metrics are showing, hide them and cancel any scheduled restart
    setShowMetrics(false);
    // Restart simulation with new algorithm
    setAlgorithm(newAlg);
    // (The useEffect will handle stopping current sim and starting a new one)
  };

  // Handler for obstacle tool toggle
  const handleToolChange = (event: any, newTool: React.SetStateAction<string>) => {
    if (!newTool) return;
    setTool(newTool);
  };

  // Handler for clicking on a grid cell
  const handleCellClick = (r: number, c: number) => {
    if (showMetrics) return;  // perhaps ignore clicks while metrics overlay is shown
    const cellKey = `${r},${c}`;
    if (tool === "add") {
      // Add obstacle if possible
      // Don't add on destination or if a car is currently there
      if ((r === DESTINATION.row && c === DESTINATION.col)) return;
      // Also avoid adding if a car occupies that cell (using current cars state)
      if (cars.find((car: { row: number; col: number; }) => car.row === r && car.col === c)) return;
      if (!obstacles.has(cellKey)) {
        const newObs = new Set(obstacles);
        newObs.add(cellKey);
        setObstacles(newObs);
      }
    } else if (tool === "remove") {
      // Remove obstacle if present
      if (obstacles.has(cellKey)) {
        const newObs = new Set(obstacles);
        newObs.delete(cellKey);
        setObstacles(newObs);
      }
    }
  };

  // Render UI
  return (
    <Box sx={{ p: 2 }}>
      {/* Top Controls: Algorithm selector and obstacle tools */}
      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Algorithm Toggle Buttons */}
        <ToggleButtonGroup
          exclusive
          color="primary"
          value={algorithm}
          onChange={handleAlgorithmChange}
          aria-label="Pathfinding Algorithm"
        >
          <ToggleButton value="BFS" aria-label="BFS algorithm">BFS</ToggleButton>
          <ToggleButton value="A*" aria-label="A* algorithm">A*</ToggleButton>
        </ToggleButtonGroup>
        {/* Obstacle Tool Toggle Buttons */}
        <ToggleButtonGroup
          exclusive
          value={tool}
          onChange={handleToolChange}
          aria-label="Obstacle Tool"
        >
          <ToggleButton value="add" aria-label="Add Obstacle">
            <Tooltip title="Add Obstacle" arrow placement="top">
              <AddIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="remove" aria-label="Remove Obstacle">
            <Tooltip title="Remove Obstacle" arrow placement="top">
              <RemoveIcon />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Grid Display */}
      <Box 
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_COLS}, 20px)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 20px)`,
          gap: '1px',             // small gap between cells (grid lines)
          backgroundColor: '#999' // grid lines color
        }}
      >
        {Array.from({ length: GRID_ROWS }).map((_, r) =>
          Array.from({ length: GRID_COLS }).map((_, c) => {
            const key = `${r},${c}`;
            let cellContent = null;
            let bgColor = '#fff';  // default empty cell color (white for road)
            let cellIcon = null;
            // Determine cell content
            if (obstacles.has(key)) {
              bgColor = '#444'; // obstacle color (dark gray)
            }
            if (r === DESTINATION.row && c === DESTINATION.col) {
              // Destination cell
              if (obstacles.has(key)) {
                // Ensure destination is never an obstacle (just in case)
                bgColor = '#fff';
              }
              // If a car is not currently on dest, show a flag/star icon
              const carOnDest = cars.find((car: { row: number; col: number; }) => car.row === r && car.col === c);
              if (carOnDest) {
                // A car is at destination (likely will be removed immediately)
                cellIcon = <CarIcon sx={{ color: 'blue', fontSize: '1rem' }} />;
              } else {
                cellIcon = <StarIcon sx={{ color: 'green', fontSize: '1rem' }} />;
              }
            }
            // Check if a car is in this cell (not at dest)
            const carHere = cars.find((car: { row: number; col: number; }) => car.row === r && car.col === c && !(r === DESTINATION.row && c === DESTINATION.col));
            if (carHere) {
              bgColor = 'transparent';
              cellIcon = <CarIcon sx={{ color: 'blue', fontSize: '1rem' }} />;
            }
            return (
              <Box 
                key={key}
                onClick={() => handleCellClick(r, c)}
                sx={{
                  width: '20px', height: '20px',
                  backgroundColor: bgColor,
                  border: '1px solid #ccc',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: showMetrics ? 'default' : 'pointer'
                }}
              >
                {cellIcon}
              </Box>
            );
          })
        )}
      </Box>

      {/* Metrics Overlay (shown when simulation ends) */}
      {showMetrics && (
        <Paper 
          elevation={6} 
          sx={{ 
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            padding: 2, minWidth: '250px', textAlign: 'center'
          }}
        >
          <Typography variant="h6" gutterBottom>Simulation Complete</Typography>
          <Typography>Total time (ticks): <b>{metrics.totalTime}</b></Typography>
          <Typography>Average time per car: <b>{metrics.avgTime.toFixed(1)}</b></Typography>
          <Typography>Shortest path length: <b>{metrics.shortestPath}</b></Typography>
        </Paper>
      )}
    </Box>
  );
}

export default PathfindingSimulation;
