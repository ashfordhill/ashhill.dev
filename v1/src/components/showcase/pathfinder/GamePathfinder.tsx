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

// Game constants - now responsive and more compact
const BASE_GRID_WIDTH = 28; // Reduced from 35
const BASE_GRID_HEIGHT = 16; // Reduced from 20
const MIN_CELL_SIZE = 8; // Reduced from 12
const MAX_CELL_SIZE = 16; // Reduced from 24
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
  const currentSection = useAppSelector((state) => state.navigation.currentSection);
  const palette = colorPalettes[currentPalette];

  // Responsive dimensions
  const [gridWidth, setGridWidth] = useState(BASE_GRID_WIDTH);
  const [gridHeight, setGridHeight] = useState(BASE_GRID_HEIGHT);
  const [cellSize, setCellSize] = useState(20);

  // Game state
  const [grid, setGrid] = useState<CellType[][]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [algorithm, setAlgorithm] = useState<Algorithm>('BFS');
  const [showPaths, setShowPaths] = useState(true);
  // Dynamic spawn points and target based on grid size
  const spawnPoints = React.useMemo<Position[]>(() => [
    { x: 1, y: Math.floor(gridHeight * 0.25) },
    { x: 1, y: Math.floor(gridHeight * 0.5) },
    { x: 1, y: Math.floor(gridHeight * 0.75) }
  ], [gridHeight]);
  
  const targetPoint = React.useMemo<Position>(() => ({ 
    x: gridWidth - 2, 
    y: Math.floor(gridHeight * 0.5) 
  }), [gridWidth, gridHeight]);

  // Refs for animation and sizing
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const carsRef = useRef<Car[]>([]);
  const isMountedRef = useRef(true); // Track if component is mounted
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Pause game when not in the fun section
  const isGameActive = currentSection === 'fun';

  // Calculate optimal grid dimensions based on available space - more compact
  const calculateOptimalDimensions = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // More compact - reduce reserved space
    const availableWidth = Math.max(250, containerRect.width - 280); // Reduced reserve space
    const availableHeight = Math.max(150, containerRect.height - 80); // Reduced reserve space
    
    // Calculate optimal cell size that fits both dimensions
    const maxCellSizeByWidth = Math.floor(availableWidth / BASE_GRID_WIDTH);
    const maxCellSizeByHeight = Math.floor(availableHeight / BASE_GRID_HEIGHT);
    const optimalCellSize = Math.max(MIN_CELL_SIZE, Math.min(MAX_CELL_SIZE, Math.min(maxCellSizeByWidth, maxCellSizeByHeight)));
    
    // Calculate grid dimensions that fit in the available space
    const maxGridWidth = Math.floor(availableWidth / optimalCellSize);
    const maxGridHeight = Math.floor(availableHeight / optimalCellSize);
    
    // Use smaller grid if needed, but maintain aspect ratio
    const newGridWidth = Math.min(BASE_GRID_WIDTH, maxGridWidth);
    const newGridHeight = Math.min(BASE_GRID_HEIGHT, maxGridHeight);
    
    // Only update if dimensions actually changed
    if (newGridWidth !== gridWidth || newGridHeight !== gridHeight || optimalCellSize !== cellSize) {
      setGridWidth(newGridWidth);
      setGridHeight(newGridHeight);
      setCellSize(optimalCellSize);
    }
  }, [gridWidth, gridHeight, cellSize]);

  // Initialize game grid (Complex maze with multiple paths)
  const initializeGrid = useCallback(() => {
    const newGrid: CellType[][] = Array(gridHeight).fill(null).map(() => 
      Array(gridWidth).fill(CellType.WALL)
    );

    // Create a complex maze with multiple possible paths
    // Start by making everything a path, then add strategic obstacles
    for (let y = 1; y < gridHeight - 1; y++) {
      for (let x = 1; x < gridWidth - 1; x++) {
        newGrid[y][x] = CellType.PATH;
      }
    }

    // Add strategic obstacles to create multiple path options (scaled to grid size)
    const scaleX = gridWidth / BASE_GRID_WIDTH;
    const scaleY = gridHeight / BASE_GRID_HEIGHT;
    
    const obstacles = [
      // Central building blocks (scaled)
      { x: Math.floor(8 * scaleX), y: Math.floor(6 * scaleY), width: Math.max(1, Math.floor(3 * scaleX)), height: Math.max(1, Math.floor(2 * scaleY)) },
      { x: Math.floor(12 * scaleX), y: Math.floor(8 * scaleY), width: Math.max(1, Math.floor(2 * scaleX)), height: Math.max(1, Math.floor(3 * scaleY)) },
      { x: Math.floor(18 * scaleX), y: Math.floor(5 * scaleY), width: Math.max(1, Math.floor(4 * scaleX)), height: Math.max(1, Math.floor(2 * scaleY)) },
      { x: Math.floor(25 * scaleX), y: Math.floor(7 * scaleY), width: Math.max(1, Math.floor(2 * scaleX)), height: Math.max(1, Math.floor(4 * scaleY)) },
      { x: Math.floor(6 * scaleX), y: Math.floor(12 * scaleY), width: Math.max(1, Math.floor(3 * scaleX)), height: Math.max(1, Math.floor(2 * scaleY)) },
      { x: Math.floor(15 * scaleX), y: Math.floor(14 * scaleY), width: Math.max(1, Math.floor(4 * scaleX)), height: Math.max(1, Math.floor(2 * scaleY)) },
      { x: Math.floor(22 * scaleX), y: Math.floor(12 * scaleY), width: Math.max(1, Math.floor(2 * scaleX)), height: Math.max(1, Math.floor(3 * scaleY)) },
      { x: Math.floor(28 * scaleX), y: Math.floor(15 * scaleY), width: Math.max(1, Math.floor(3 * scaleX)), height: Math.max(1, Math.floor(2 * scaleY)) },
      
      // Smaller obstacles for path variety (scaled)
      { x: Math.floor(4 * scaleX), y: Math.floor(8 * scaleY), width: 1, height: Math.max(1, Math.floor(2 * scaleY)) },
      { x: Math.floor(16 * scaleX), y: Math.floor(4 * scaleY), width: 1, height: 1 },
      { x: Math.floor(20 * scaleX), y: Math.floor(9 * scaleY), width: 1, height: 1 },
      { x: Math.floor(30 * scaleX), y: Math.floor(6 * scaleY), width: 1, height: Math.max(1, Math.floor(2 * scaleY)) },
      { x: Math.floor(10 * scaleX), y: Math.floor(16 * scaleY), width: 1, height: 1 },
      { x: Math.floor(26 * scaleX), y: Math.floor(4 * scaleY), width: 1, height: 1 },
    ].filter(obstacle => 
      obstacle.x >= 1 && obstacle.x < gridWidth - 1 && 
      obstacle.y >= 1 && obstacle.y < gridHeight - 1
    );

    // Place obstacles
    obstacles.forEach(({ x, y, width, height }) => {
      for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
          const newX = x + dx;
          const newY = y + dy;
          if (newX >= 1 && newX < gridWidth - 1 && newY >= 1 && newY < gridHeight - 1) {
            newGrid[newY][newX] = CellType.WALL;
          }
        }
      }
    });

    // Ensure there are always clear paths from spawn to target
    // Create guaranteed horizontal corridors (scaled)
    const corridors = [
      Math.floor(3 * scaleY), 
      Math.floor(gridHeight * 0.5), 
      Math.floor(16 * scaleY)
    ].filter(y => y >= 1 && y < gridHeight - 1);
    
    corridors.forEach(y => {
      for (let x = 1; x < gridWidth - 1; x++) {
        // Leave some gaps for interesting pathfinding
        const gapFreq = Math.max(5, Math.floor(7 * scaleX));
        if (x % gapFreq !== 0 || Math.random() > 0.3) {
          newGrid[y][x] = CellType.PATH;
        }
      }
    });

    // Create guaranteed vertical corridors (scaled)
    const verticalCorridors = [
      Math.floor(7 * scaleX), 
      Math.floor(14 * scaleX), 
      Math.floor(21 * scaleX), 
      Math.floor(28 * scaleX)
    ].filter(x => x >= 1 && x < gridWidth - 1);
    
    verticalCorridors.forEach(x => {
      for (let y = 1; y < gridHeight - 1; y++) {
        const gapFreq = Math.max(3, Math.floor(5 * scaleY));
        if (y % gapFreq !== 0 || Math.random() > 0.4) {
          newGrid[y][x] = CellType.PATH;
        }
      }
    });

    // Set spawn points
    spawnPoints.forEach(pos => {
      if (pos.y >= 0 && pos.y < gridHeight && pos.x >= 0 && pos.x < gridWidth) {
        newGrid[pos.y][pos.x] = CellType.SPAWN;
        // Ensure spawn points are connected
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const newX = pos.x + dx;
            const newY = pos.y + dy;
            if (newX >= 1 && newX < gridWidth - 1 && newY >= 1 && newY < gridHeight - 1) {
              if (Math.abs(dx) + Math.abs(dy) === 1) { // Only adjacent cells, not diagonals
                newGrid[newY][newX] = CellType.PATH;
              }
            }
          }
        }
      }
    });

    // Set target
    if (targetPoint.y >= 0 && targetPoint.y < gridHeight && targetPoint.x >= 0 && targetPoint.x < gridWidth) {
      newGrid[targetPoint.y][targetPoint.x] = CellType.TARGET;
      // Ensure target is accessible
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const newX = targetPoint.x + dx;
          const newY = targetPoint.y + dy;
          if (newX >= 1 && newX < gridWidth - 1 && newY >= 1 && newY < gridHeight - 1) {
            if (Math.abs(dx) + Math.abs(dy) === 1) { // Only adjacent cells, not diagonals
              newGrid[newY][newX] = CellType.PATH;
            }
          }
        }
      }
    }

    setGrid(newGrid);
  }, [spawnPoints, targetPoint, gridWidth, gridHeight]);

  // Initialize cars
  const initializeCars = useCallback((algorithmToUse?: Algorithm) => {
    const colors = ['#ff4444', '#44ff44', '#4444ff'];
    const newCars: Car[] = [];
    
    // Use the provided algorithm or fall back to the current state
    const currentAlgorithm = algorithmToUse || algorithm;
    
    console.log('Initializing cars with algorithm:', currentAlgorithm);

    // Create one car per spawn point
    for (let i = 0; i < spawnPoints.length; i++) {
      const spawnPoint = spawnPoints[i];
      const pathfinder = getPathfindingFunction(currentAlgorithm);
      const path = pathfinder(spawnPoint, targetPoint, {
        grid,
        gridWidth: gridWidth,
        gridHeight: gridHeight
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
  }, [spawnPoints, targetPoint, algorithm, grid, gridWidth, gridHeight]);

  // Animation loop
  const animate = useCallback(() => {
    if (!isRunning || !isMountedRef.current || !isGameActive) return;

    setCars(prevCars => {
      const newCars = prevCars.map(car => {
        if (car.path.length === 0 || car.pathIndex >= car.path.length - 1) {
          // Car reached target, respawn with current algorithm
          const pathfinder = getPathfindingFunction(algorithm);
          const spawnPoint = spawnPoints[car.id % spawnPoints.length];
          const newPath = pathfinder(spawnPoint, targetPoint, {
            grid,
            gridWidth: gridWidth,
            gridHeight: gridHeight
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

    if (isRunning && isMountedRef.current && isGameActive) {
      animationRef.current = setTimeout(animate, ANIMATION_SPEED);
    }
  }, [isRunning, algorithm, spawnPoints, targetPoint, grid, isGameActive, gridWidth, gridHeight]);

  // Initialize grid on mount and when dimensions change
  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  // Set up resize observer to handle dynamic sizing
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      calculateOptimalDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Initial calculation
    calculateOptimalDimensions();

    return () => {
      resizeObserver.disconnect();
    };
  }, [calculateOptimalDimensions]);

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
    if (isRunning && isMountedRef.current && isGameActive) {
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
  }, [isRunning, animate, isGameActive]);

  // Auto-pause when section changes
  useEffect(() => {
    if (!isGameActive && isRunning) {
      setIsRunning(false);
    }
  }, [isGameActive, isRunning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);

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
    <Box 
      ref={containerRef}
      sx={{ 
        p: { xs: 0.5, sm: 1 }, // Reduced padding
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        width: '100%',
        height: '100%',
        minHeight: 0, // Allow shrinking
        overflow: 'hidden',
        maxHeight: '90vh' // Prevent taking full screen height
      }}>
      {/* Controls */}
      <Box sx={{ 
        mb: { xs: 0.5, sm: 1 }, // Reduced margin
        display: 'flex', 
        gap: { xs: 0.5, sm: 1 }, // Reduced gap
        alignItems: 'center', 
        flexWrap: 'wrap', 
        justifyContent: 'center',
        flexShrink: 0
      }}>
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

      {/* Main Game Area */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', lg: 'row' },
        gap: { xs: 1, sm: 1.5 }, // Reduced gap
        alignItems: { xs: 'center', lg: 'flex-start' }, 
        justifyContent: 'center',
        width: '100%',
        maxWidth: '100%',
        flex: 1,
        minHeight: 0,
        overflow: 'auto' // Allow scrolling if needed
      }}>
        {/* Game Grid */}
        <Box
          sx={{
            display: 'inline-block',
            border: `2px solid ${palette.border}`,
            borderRadius: '6px', // Slightly smaller radius
            backgroundColor: '#1a1a1a',
            padding: { xs: '2px', sm: '4px' }, // Reduced padding
            position: 'relative',
            flexShrink: 1,
            minWidth: 0,
            maxWidth: '100%',
            maxHeight: '60vh', // Limit height to prevent overflow
            overflow: 'auto' // Add scrollbar if content overflows
          }}
        >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridWidth}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${gridHeight}, ${cellSize}px)`,
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
                  width: cellSize,
                  height: cellSize,
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
                left: car.position.x * (cellSize + 1) + 2,
                top: car.position.y * (cellSize + 1) + 2,
                width: cellSize - 4,
                height: cellSize - 4,
                backgroundColor: car.color,
                borderRadius: '50%',
                border: '2px solid #fff',
                transition: `all ${ANIMATION_SPEED * 0.8}ms ease-in-out`,
                zIndex: 10
              }}
            />
          ))}

          {/* Path visualization */}
          {showPaths && cars.map(car => 
            car.path.map((pos, index) => (
              <Box
                key={`${car.id}-path-${index}`}
                sx={{
                  position: 'absolute',
                  left: pos.x * (cellSize + 1) + cellSize / 2 - 1,
                  top: pos.y * (cellSize + 1) + cellSize / 2 - 1,
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

        {/* Information Panel */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'row', lg: 'column' },
          flexWrap: { xs: 'wrap', lg: 'nowrap' },
          gap: { xs: 0.5, sm: 1 }, // Reduced gap
          minWidth: { xs: '100%', lg: '220px' }, // Reduced min width
          maxWidth: { xs: '100%', lg: '260px' }, // Reduced max width
          maxHeight: { lg: '60vh' }, // Limit height on large screens
          overflow: { lg: 'auto' }, // Add scrollbar on large screens when needed
          flexShrink: 0
        }}>
          {/* Path Information */}
          <Box sx={{ 
            p: { xs: 1, sm: 1.5 }, // Reduced padding
            border: `1px solid ${palette.border}`,
            borderRadius: '6px', // Smaller radius
            backgroundColor: palette.background + '40',
            flex: { xs: '1 1 250px', lg: 'none' }, // Reduced flex basis
            minWidth: { xs: '200px', lg: 'auto' } // Reduced min width
          }}>
            <Typography sx={{ color: palette.text, fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold', mb: 1 }}> 
              Car Paths ({algorithm})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}> {/* Reduced gap */}
              {cars.map(car => (
                <Box key={car.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      backgroundColor: car.color,
                      borderRadius: '50%',
                      border: '1px solid #fff',
                      flexShrink: 0
                    }}
                  />
                  <Typography sx={{ color: palette.text, fontSize: { xs: '10px', sm: '12px' } }}>
                    Car {car.id + 1}: {car.path.length > 0 ? `${car.path.length} steps` : 'No path'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Legend */}
          <Box sx={{ 
            p: { xs: 1, sm: 1.5 }, // Reduced padding
            border: `1px solid ${palette.border}`,
            borderRadius: '6px', // Smaller radius
            backgroundColor: palette.background + '40',
            flex: { xs: '1 1 200px', lg: 'none' }, // Reduced flex basis
            minWidth: { xs: '180px', lg: 'auto' } // Reduced min width
          }}>
            <Typography sx={{ color: palette.text, fontSize: { xs: '11px', sm: '13px' }, fontWeight: 'bold', mb: 1 }}>
              Legend
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}> {/* Reduced gap */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: palette.primary + '80', border: `1px solid ${palette.primary}` }} />
                <Typography sx={{ color: palette.text, fontSize: { xs: '10px', sm: '12px' } }}>Spawn (S)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: palette.secondary + '80', border: `1px solid ${palette.secondary}` }} />
                <Typography sx={{ color: palette.text, fontSize: { xs: '10px', sm: '12px' } }}>Target (T)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#4a4a4a', border: '1px solid #666' }} />
                <Typography sx={{ color: palette.text, fontSize: { xs: '10px', sm: '12px' } }}>Walls</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                <Typography sx={{ color: palette.text, fontSize: { xs: '10px', sm: '12px' } }}>Paths</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      {/* Horizontal Development Note (moved out of side panel) */}
      <Box
        sx={{
          mt: 1,
          width: '100%',
          borderTop: `1px solid ${palette.border}40`,
          background: `linear-gradient(90deg, ${palette.background}80, ${palette.primary}10 40%, ${palette.secondary}10 100%)`,
          p: { xs: 1, sm: 1.25 },
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Typography
          variant="caption"
          sx={{
            maxWidth: 900,
            color: palette.text + '99',
            fontFamily: 'monospace',
            fontSize: { xs: '0.62rem', sm: '0.7rem' },
            lineHeight: 1.35,
            letterSpacing: 0.25,
            textAlign: 'center'
          }}
        >
          🎨 Experiment log: Tried swapping grid Boxes with third party tilesheet sprites (Kenney.nl) with GPT‑4o & Claude Sonnet 3.5. Even with iterative prompts + manual tweaks the scene graph + sprite atlas math kept drifting. Leaving this version performant & readable for now; will revisit with a focused rendering pass.
        </Typography>
      </Box>
    </Box>
  );
};

export default GamePathfinder;