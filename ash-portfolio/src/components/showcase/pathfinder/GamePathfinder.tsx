// Game-like Pathfinder inspired by Pac-Man ghost AI
// Clean, optimized, and visually appealing

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Button, Select, MenuItem, FormControl, FormControlLabel, Switch } from '@mui/material';
import { useAppSelector } from '../../../store/hooks';
import { colorPalettes } from '../../../store/slices/themeSlice';
import { Position, CellType, Algorithm, getPathfindingFunction, ALGORITHM_NAMES } from './algorithms';

// Icons
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RefreshIcon from '@mui/icons-material/Refresh';

// Game constants
const GRID_WIDTH = 35;
const GRID_HEIGHT = 20;
const CELL_SIZE = 20;
const MAX_CARS = 8;
const ANIMATION_SPEED = 150; // ms between moves

// Car interface
interface Car {
  id: number;
  position: Position;
  target: Position;
  path: Position[];
  color: string;
  isMoving: boolean;
  pathIndex: number;
}

const GamePathfinder: React.FC = () => {
  // Get current palette from Redux store
  const currentPalette = useAppSelector((state) => state.theme.currentPalette);
  const palette = colorPalettes[currentPalette];

  // Game state
  const [grid, setGrid] = useState<CellType[][]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [algorithm, setAlgorithm] = useState<Algorithm>('BFS');
  const [showPaths, setShowPaths] = useState(true);
  const [spawnPoints] = useState<Position[]>([
    { x: 1, y: 5 },
    { x: 1, y: 10 },
    { x: 1, y: 15 }
  ]);
  const [targetPoint] = useState<Position>({ x: GRID_WIDTH - 2, y: 10 });

  // Refs for animation
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const carsRef = useRef<Car[]>([]);

  // Initialize game grid (Complex maze with multiple paths)
  const initializeGrid = useCallback(() => {
    const newGrid: CellType[][] = Array(GRID_HEIGHT).fill(null).map(() => 
      Array(GRID_WIDTH).fill(CellType.WALL)
    );

    // Create a complex maze with multiple possible paths
    // Start by making everything a path, then add strategic obstacles
    for (let y = 1; y < GRID_HEIGHT - 1; y++) {
      for (let x = 1; x < GRID_WIDTH - 1; x++) {
        newGrid[y][x] = CellType.PATH;
      }
    }

    // Add strategic obstacles to create multiple path options
    const obstacles = [
      // Central building blocks
      { x: 8, y: 6, width: 3, height: 2 },
      { x: 12, y: 8, width: 2, height: 3 },
      { x: 18, y: 5, width: 4, height: 2 },
      { x: 25, y: 7, width: 2, height: 4 },
      { x: 6, y: 12, width: 3, height: 2 },
      { x: 15, y: 14, width: 4, height: 2 },
      { x: 22, y: 12, width: 2, height: 3 },
      { x: 28, y: 15, width: 3, height: 2 },
      
      // Smaller obstacles for path variety
      { x: 4, y: 8, width: 1, height: 2 },
      { x: 16, y: 4, width: 1, height: 1 },
      { x: 20, y: 9, width: 1, height: 1 },
      { x: 30, y: 6, width: 1, height: 2 },
      { x: 10, y: 16, width: 1, height: 1 },
      { x: 26, y: 4, width: 1, height: 1 },
    ];

    // Place obstacles
    obstacles.forEach(({ x, y, width, height }) => {
      for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
          const newX = x + dx;
          const newY = y + dy;
          if (newX >= 1 && newX < GRID_WIDTH - 1 && newY >= 1 && newY < GRID_HEIGHT - 1) {
            newGrid[newY][newX] = CellType.WALL;
          }
        }
      }
    });

    // Ensure there are always clear paths from spawn to target
    // Create guaranteed horizontal corridors
    const corridors = [3, 10, 16];
    corridors.forEach(y => {
      for (let x = 1; x < GRID_WIDTH - 1; x++) {
        // Leave some gaps for interesting pathfinding
        if (x % 7 !== 0 || Math.random() > 0.3) {
          newGrid[y][x] = CellType.PATH;
        }
      }
    });

    // Create guaranteed vertical corridors
    const verticalCorridors = [7, 14, 21, 28];
    verticalCorridors.forEach(x => {
      for (let y = 1; y < GRID_HEIGHT - 1; y++) {
        if (y % 5 !== 0 || Math.random() > 0.4) {
          newGrid[y][x] = CellType.PATH;
        }
      }
    });

    // Set spawn points
    spawnPoints.forEach(pos => {
      if (pos.y >= 0 && pos.y < GRID_HEIGHT && pos.x >= 0 && pos.x < GRID_WIDTH) {
        newGrid[pos.y][pos.x] = CellType.SPAWN;
        // Ensure spawn points are connected
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const newX = pos.x + dx;
            const newY = pos.y + dy;
            if (newX >= 1 && newX < GRID_WIDTH - 1 && newY >= 1 && newY < GRID_HEIGHT - 1) {
              if (Math.abs(dx) + Math.abs(dy) === 1) { // Only adjacent cells, not diagonals
                newGrid[newY][newX] = CellType.PATH;
              }
            }
          }
        }
      }
    });

    // Set target
    if (targetPoint.y >= 0 && targetPoint.y < GRID_HEIGHT && targetPoint.x >= 0 && targetPoint.x < GRID_WIDTH) {
      newGrid[targetPoint.y][targetPoint.x] = CellType.TARGET;
      // Ensure target is accessible
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const newX = targetPoint.x + dx;
          const newY = targetPoint.y + dy;
          if (newX >= 1 && newX < GRID_WIDTH - 1 && newY >= 1 && newY < GRID_HEIGHT - 1) {
            if (Math.abs(dx) + Math.abs(dy) === 1) { // Only adjacent cells, not diagonals
              newGrid[newY][newX] = CellType.PATH;
            }
          }
        }
      }
    }

    setGrid(newGrid);
  }, [spawnPoints, targetPoint]);

  // Initialize cars
  const initializeCars = useCallback((algorithmToUse?: Algorithm) => {
    const colors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff', '#ff8844', '#8844ff'];
    const newCars: Car[] = [];
    
    // Use the provided algorithm or fall back to the current state
    const currentAlgorithm = algorithmToUse || algorithm;
    
    console.log('Initializing cars with algorithm:', currentAlgorithm);

    for (let i = 0; i < Math.min(MAX_CARS, spawnPoints.length * 3); i++) {
      const spawnPoint = spawnPoints[i % spawnPoints.length];
      const pathfinder = getPathfindingFunction(currentAlgorithm);
      const path = pathfinder(spawnPoint, targetPoint, {
        grid,
        gridWidth: GRID_WIDTH,
        gridHeight: GRID_HEIGHT
      });
      
      newCars.push({
        id: i,
        position: { ...spawnPoint },
        target: targetPoint,
        path,
        color: colors[i % colors.length],
        isMoving: false,
        pathIndex: 0
      });
    }

    setCars(newCars);
    carsRef.current = newCars;
  }, [spawnPoints, targetPoint, algorithm, grid]);

  // Animation loop
  const animate = useCallback(() => {
    if (!isRunning) return;

    setCars(prevCars => {
      const newCars = prevCars.map(car => {
        if (car.path.length === 0 || car.pathIndex >= car.path.length - 1) {
          // Car reached target, respawn with current algorithm
          const pathfinder = getPathfindingFunction(algorithm);
          const spawnPoint = spawnPoints[car.id % spawnPoints.length];
          const newPath = pathfinder(spawnPoint, targetPoint, {
            grid,
            gridWidth: GRID_WIDTH,
            gridHeight: GRID_HEIGHT
          });
          
          return {
            ...car,
            position: { ...spawnPoint },
            path: newPath,
            pathIndex: 0,
            isMoving: true
          };
        }

        // Move to next position in path
        const nextIndex = car.pathIndex + 1;
        if (nextIndex < car.path.length) {
          return {
            ...car,
            position: { ...car.path[nextIndex] },
            pathIndex: nextIndex,
            isMoving: true
          };
        }

        return car;
      });

      carsRef.current = newCars;
      return newCars;
    });

    animationRef.current = setTimeout(animate, ANIMATION_SPEED);
  }, [isRunning, algorithm, spawnPoints, targetPoint, grid]);

  // Initialize grid on mount
  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  // Initialize cars when grid changes or algorithm changes
  useEffect(() => {
    if (grid.length > 0) {
      // Small delay to ensure all state updates are complete
      const timeoutId = setTimeout(() => {
        initializeCars();
      }, 10);
      
      return () => clearTimeout(timeoutId);
    }
  }, [grid, algorithm, initializeCars]);

  // Start/stop animation
  useEffect(() => {
    if (isRunning) {
      animate();
    } else {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
      }
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isRunning, animate]);

  // Handle algorithm change
  const handleAlgorithmChange = (newAlgorithm: Algorithm) => {
    console.log('Algorithm changed from', algorithm, 'to', newAlgorithm);
    setAlgorithm(newAlgorithm);
    // Recalculate paths for all cars with the new algorithm
    if (grid.length > 0) {
      initializeCars(newAlgorithm);
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsRunning(!isRunning);
  };

  // Reset simulation
  const reset = () => {
    setIsRunning(false);
    if (grid.length > 0) {
      initializeCars();
    }
  };

  // Get cell color
  const getCellColor = (cellType: CellType) => {
    switch (cellType) {
      case CellType.WALL: return '#4a4a4a'; // Building/obstacle color
      case CellType.PATH: return '#1a1a1a'; // Dark road color
      case CellType.SPAWN: return palette.primary + '80';
      case CellType.TARGET: return palette.secondary + '80';
      default: return '#4a4a4a';
    }
  };

  // Get cell border
  const getCellBorder = (cellType: CellType) => {
    switch (cellType) {
      case CellType.WALL: return `1px solid #666`; // Building border
      case CellType.PATH: return `1px solid #333`; // Road border
      case CellType.SPAWN: return `2px solid ${palette.primary}`;
      case CellType.TARGET: return `2px solid ${palette.secondary}`;
      default: return `1px solid #666`;
    }
  };

  // Get cell content/symbol
  const getCellContent = (cellType: CellType, x: number, y: number) => {
    switch (cellType) {
      case CellType.WALL: 
        // Add building-like symbols for variety
        const symbols = ['▪', '■', '▫', '□'];
        return symbols[(x + y) % symbols.length];
      case CellType.SPAWN: return 'S';
      case CellType.TARGET: return 'T';
      default: return '';
    }
  };

  return (
    <Box sx={{ 
      p: 2, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      width: '100%'
    }}>
      {/* Controls */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={togglePlayPause}
          startIcon={isRunning ? <PauseIcon /> : <PlayArrowIcon />}
          sx={{ 
            backgroundColor: palette.primary,
            '&:hover': { backgroundColor: palette.primary + 'dd' }
          }}
        >
          {isRunning ? 'Pause' : 'Play'}
        </Button>

        <Button
          variant="outlined"
          onClick={reset}
          startIcon={<RefreshIcon />}
          sx={{ 
            borderColor: palette.border,
            color: palette.text,
            '&:hover': { borderColor: palette.primary }
          }}
        >
          Reset
        </Button>

        <FormControl size="small" sx={{ minWidth: 80 }}>
          <Select
            value={algorithm}
            onChange={(e) => handleAlgorithmChange(e.target.value as Algorithm)}
            sx={{ 
              color: palette.text,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: palette.border },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: palette.primary }
            }}
          >
            <MenuItem value="BFS">{ALGORITHM_NAMES.BFS}</MenuItem>
            <MenuItem value="DFS">{ALGORITHM_NAMES.DFS}</MenuItem>
            {/* <MenuItem value="A*">{ALGORITHM_NAMES['A*']}</MenuItem>
            <MenuItem value="Dijkstra">{ALGORITHM_NAMES.Dijkstra}</MenuItem> */}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={showPaths}
              onChange={(e) => setShowPaths(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: palette.primary },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: palette.primary }
              }}
            />
          }
          label={<Typography sx={{ color: palette.text }}>Show Paths</Typography>}
        />
      </Box>

      {/* Game Grid */}
      <Box
        sx={{
          display: 'inline-block',
          border: `3px solid ${palette.border}`,
          borderRadius: '8px',
          backgroundColor: '#1a1a1a',
          padding: '8px',
          position: 'relative'
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_WIDTH}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${GRID_HEIGHT}, ${CELL_SIZE}px)`,
            gap: '1px',
            position: 'relative'
          }}
        >
          {/* Grid cells */}
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <Box
                key={`${x}-${y}`}
                sx={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: getCellColor(cell),
                  border: getCellBorder(cell),
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Cell content */}
                {getCellContent(cell, x, y) && (
                  <Typography sx={{ 
                    fontSize: cell === CellType.WALL ? '8px' : '10px', 
                    color: cell === CellType.WALL ? '#666' : 
                           cell === CellType.SPAWN ? palette.primary : 
                           cell === CellType.TARGET ? palette.secondary : palette.text,
                    fontWeight: cell === CellType.WALL ? 'normal' : 'bold',
                    userSelect: 'none'
                  }}>
                    {getCellContent(cell, x, y)}
                  </Typography>
                )}
              </Box>
            ))
          )}

          {/* Cars */}
          {cars.map(car => (
            <Box
              key={car.id}
              sx={{
                position: 'absolute',
                left: car.position.x * (CELL_SIZE + 1) + 2,
                top: car.position.y * (CELL_SIZE + 1) + 2,
                width: CELL_SIZE - 4,
                height: CELL_SIZE - 4,
                backgroundColor: car.color,
                borderRadius: '50%',
                border: '2px solid #fff',
                transition: `all ${ANIMATION_SPEED * 0.8}ms ease-in-out`,
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography sx={{ fontSize: '8px', color: '#fff', fontWeight: 'bold' }}>
                {car.id + 1}
              </Typography>
            </Box>
          ))}

          {/* Path visualization */}
          {showPaths && cars.map(car => 
            car.path.map((pos, index) => (
              <Box
                key={`${car.id}-path-${index}`}
                sx={{
                  position: 'absolute',
                  left: pos.x * (CELL_SIZE + 1) + CELL_SIZE / 2 - 1,
                  top: pos.y * (CELL_SIZE + 1) + CELL_SIZE / 2 - 1,
                  width: 2,
                  height: 2,
                  backgroundColor: car.color + '60',
                  borderRadius: '50%',
                  zIndex: 5
                }}
              />
            ))
          )}
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography sx={{ color: palette.text, fontSize: '14px' }}>
          Algorithm: {algorithm} | Cars: {cars.length} | Status: {isRunning ? 'Running' : 'Paused'}
        </Typography>
      </Box>
    </Box>
  );
};

export default GamePathfinder;