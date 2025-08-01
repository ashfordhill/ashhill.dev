import React, { useState, useEffect, useRef } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography, Paper, Tooltip, Button } from '@mui/material';
import { SimulationEngine, SimulationMetrics } from './engine/SimulationEngine';
import { Grid, GridPosition } from './data/Grid';
import { Car } from './data/Car';
import { useAppSelector } from '../../../store/hooks';
import { colorPalettes } from '../../../store/slices/themeSlice';

// Icons
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import StarIcon from '@mui/icons-material/Star';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';

const PathfinderVisualizer: React.FC = () => {
  // Engine instance
  const engineRef = useRef<SimulationEngine>(new SimulationEngine());
  
  // Get current palette from Redux store
  const currentPalette = useAppSelector((state) => state.theme.currentPalette);
  const palette = colorPalettes[currentPalette];

  // UI state
  const [cars, setCars] = useState<Car[]>([]);
  const [gridUpdateTrigger, setGridUpdateTrigger] = useState<number>(0);
  const [algorithm, setAlgorithm] = useState<string>('BFS');
  const [tool, setTool] = useState<string>('add');
  const [showMetrics, setShowMetrics] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<SimulationMetrics>({
    totalTime: 0,
    avgTime: 0,
    shortestPath: 0
  });

  // Initialize the simulation
  useEffect(() => {
    const engine = engineRef.current;
    
    // Set up callbacks
    engine.setOnTick(() => {
      setCars([...engine.getState().cars]);
      setIsRunning(engine.getState().isRunning);
    });
    
    engine.setOnComplete((simulationMetrics) => {
      setMetrics(simulationMetrics);
      setShowMetrics(true);
      setIsRunning(false);
      
      // After a brief pause, restart the simulation
      setTimeout(() => {
        if (!engine.getState().isRunning) {
          setShowMetrics(false);
          engine.start();
          setIsRunning(true);
        }
      }, 3000);
    });
    
    // Start the simulation
    engine.start();
    setIsRunning(true);
    
    // Cleanup on unmount
    return () => {
      engine.stop();
    };
  }, []);

  // Change algorithm
  useEffect(() => {
    const engine = engineRef.current;
    engine.stop();
    engine.setAlgorithm(algorithm);
    setShowMetrics(false);
    engine.start();
    setIsRunning(true);
  }, [algorithm]);

  // Handler for algorithm toggle
  const handleAlgorithmChange = (event: React.MouseEvent<HTMLElement>, newAlg: string) => {
    if (!newAlg || newAlg === algorithm) return;
    setAlgorithm(newAlg);
  };

  // Handler for obstacle tool toggle
  const handleToolChange = (event: React.MouseEvent<HTMLElement>, newTool: string) => {
    if (!newTool) return;
    setTool(newTool);
  };

  // Handler for play/pause
  const handlePlayPause = () => {
    const engine = engineRef.current;
    if (isRunning) {
      engine.stop();
      setIsRunning(false);
    } else {
      engine.start();
      setIsRunning(true);
    }
  };



  // Handler for clicking on a grid cell
  const handleCellClick = (position: GridPosition) => {
    if (showMetrics) return;
    
    const engine = engineRef.current;
    const { row, col } = position;
    
    if (tool === 'add') {
      engine.addObstacle(position);
    } else if (tool === 'remove') {
      engine.removeObstacle(position);
    }
    
    // Trigger a re-render to show the updated grid
    setGridUpdateTrigger(prev => prev + 1);
  };

  // Render the grid
  const renderGrid = () => {
    const grid = engineRef.current.getState().grid; // Always get fresh grid from engine
    const rows = grid.rows;
    const cols = grid.cols;
    const cellSize = 12; // Smaller cells for more retro feel
    
    return (
      <Box 
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
          gap: '1px',
          backgroundColor: palette.background,
          border: `2px solid ${palette.border}`,
          borderRadius: '4px',
          padding: '8px',
          boxShadow: `0 0 20px ${palette.border}40`,
        }}
      >
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => {
            const position = { row: r, col: c };
            const key = `${r},${c}`;
            let bgColor: string = palette.grid;
            let borderColor: string = palette.border + '40';
            let glowColor: string = 'transparent';
            let cellContent: string | null = null;
            
            // Check if this cell is an obstacle
            if (grid.isObstacle(position)) {
              bgColor = palette.obstacle;
              borderColor = palette.border + '80';
            }
            
            // Check if this cell is a spawn point
            if (grid.isSpawnPoint(position)) {
              bgColor = palette.spawn + '40';
              borderColor = palette.spawn;
              glowColor = palette.spawn + '60';
              cellContent = '◆';
            }
            
            // Check if this cell is the destination
            if (grid.isDestination(position)) {
              bgColor = palette.destination + '40';
              borderColor = palette.destination;
              glowColor = palette.destination + '60';
              cellContent = '★';
            }
            
            // Check if a car is in this cell
            const carHere = cars.find(car => 
              car.position.row === r && car.position.col === c
            );
            
            if (carHere) {
              bgColor = palette.car + '80';
              borderColor = palette.car;
              glowColor = palette.car + '60';
              cellContent = '●';
            }
            
            return (
              <Box 
                key={key}
                onClick={() => handleCellClick(position)}
                sx={{
                  width: `${cellSize}px`, 
                  height: `${cellSize}px`,
                  backgroundColor: bgColor,
                  border: `1px solid ${borderColor}`,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  cursor: showMetrics ? 'default' : 'crosshair',
                  fontSize: '8px',
                  color: palette.text,
                  fontWeight: 'bold',
                  transition: 'all 0.1s ease',
                  boxShadow: glowColor !== 'transparent' ? `0 0 4px ${glowColor}` : 'none',
                  '&:hover': {
                    backgroundColor: showMetrics ? bgColor : palette.primary + '20',
                    boxShadow: showMetrics ? (glowColor !== 'transparent' ? `0 0 4px ${glowColor}` : 'none') : `0 0 6px ${palette.primary}60`,
                  }
                }}
              >
                {cellContent}
              </Box>
            );
          })
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ 
      minHeight: '70vh',
      backgroundColor: palette.background,
      color: palette.text,
      fontFamily: 'monospace',
      overflow: 'hidden'
    }}>
      {/* Main Content Area */}
      <Box sx={{ display: 'flex', height: '70vh' }}>
        {/* Left Sidebar - Controls and Metrics */}
        <Box sx={{
          width: '300px',
          p: 3,
          borderRight: `2px solid ${palette.border}`,
          backgroundColor: palette.background,
          boxShadow: `2px 0 10px ${palette.border}40`
        }}>
          {/* Algorithm Section */}
          <Box sx={{
            border: `2px solid ${palette.border}`,
            borderRadius: '8px',
            p: 2,
            mb: 3,
            boxShadow: `0 0 15px ${palette.border}40`
          }}>
            <Typography variant="h6" sx={{ 
              color: palette.secondary, 
              mb: 2, 
              fontFamily: 'monospace',
              textShadow: `0 0 5px ${palette.secondary}80`
            }}>
              ALGORITHM
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {engineRef.current.getAvailableAlgorithms().map((alg) => (
                <Button
                  key={alg}
                  variant={algorithm === alg ? 'contained' : 'outlined'}
                  onClick={() => setAlgorithm(alg)}
                  sx={{
                    color: algorithm === alg ? palette.background : palette.secondary,
                    backgroundColor: algorithm === alg ? palette.secondary : 'transparent',
                    borderColor: palette.secondary,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: palette.secondary + '20',
                      borderColor: palette.secondary,
                      boxShadow: `0 0 10px ${palette.secondary}60`
                    }
                  }}
                >
                  {alg}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Controls Section */}
          <Box sx={{
            border: `2px solid ${palette.border}`,
            borderRadius: '8px',
            p: 2,
            mb: 3,
            boxShadow: `0 0 15px ${palette.border}40`
          }}>
            <Typography variant="h6" sx={{ 
              color: palette.secondary, 
              mb: 2, 
              fontFamily: 'monospace',
              textShadow: `0 0 5px ${palette.secondary}80`
            }}>
              CONTROLS
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Play/Pause Button */}
              <Button
                variant="contained"
                onClick={handlePlayPause}
                startIcon={isRunning ? <StopIcon /> : <PlayArrowIcon />}
                sx={{
                  backgroundColor: palette.primary,
                  color: palette.background,
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: palette.primary + 'CC',
                    boxShadow: `0 0 15px ${palette.primary}80`
                  }
                }}
              >
                {isRunning ? 'STOP' : 'START'}
              </Button>

              {/* Tool Selection */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant={tool === 'add' ? 'contained' : 'outlined'}
                  onClick={() => setTool('add')}
                  startIcon={<AddIcon />}
                  sx={{
                    flex: 1,
                    color: tool === 'add' ? palette.background : palette.accent,
                    backgroundColor: tool === 'add' ? palette.accent : 'transparent',
                    borderColor: palette.accent,
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                    '&:hover': {
                      backgroundColor: palette.accent + '20',
                      boxShadow: `0 0 8px ${palette.accent}60`
                    }
                  }}
                >
                  ADD
                </Button>
                <Button
                  variant={tool === 'remove' ? 'contained' : 'outlined'}
                  onClick={() => setTool('remove')}
                  startIcon={<RemoveIcon />}
                  sx={{
                    flex: 1,
                    color: tool === 'remove' ? palette.background : palette.accent,
                    backgroundColor: tool === 'remove' ? palette.accent : 'transparent',
                    borderColor: palette.accent,
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                    '&:hover': {
                      backgroundColor: palette.accent + '20',
                      boxShadow: `0 0 8px ${palette.accent}60`
                    }
                  }}
                >
                  REMOVE
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Metrics Section */}
          <Box sx={{
            border: `2px solid ${palette.border}`,
            borderRadius: '8px',
            p: 2,
            boxShadow: `0 0 15px ${palette.border}40`
          }}>
            <Typography variant="h6" sx={{ 
              color: palette.secondary, 
              mb: 2, 
              fontFamily: 'monospace',
              textShadow: `0 0 5px ${palette.secondary}80`
            }}>
              METRICS
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography sx={{ color: palette.text, fontFamily: 'monospace' }}>
                <span style={{ color: palette.accent }}>Average Time:</span><br />
                <span style={{ color: palette.primary, fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {metrics.avgTime.toFixed(1)}
                </span>
              </Typography>
              
              <Typography sx={{ color: palette.text, fontFamily: 'monospace' }}>
                <span style={{ color: palette.accent }}>Cars En Route:</span><br />
                <span style={{ color: palette.primary, fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {cars.length}
                </span>
              </Typography>
              
              <Typography sx={{ color: palette.text, fontFamily: 'monospace' }}>
                <span style={{ color: palette.accent }}>Destination Rate:</span><br />
                <span style={{ color: palette.primary, fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {metrics.shortestPath > 0 ? '94%' : '--'}
                </span>
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right Side - Grid Display */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3,
          backgroundColor: palette.background
        }}>
          {renderGrid()}
        </Box>
      </Box>

      {/* Metrics Overlay (shown when simulation ends) */}
      {showMetrics && (
        <Box
          sx={{ 
            position: 'fixed', 
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: palette.background + 'CC',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              padding: 4, 
              minWidth: '400px', 
              textAlign: 'center',
              backgroundColor: palette.background,
              border: `3px solid ${palette.primary}`,
              borderRadius: '12px',
              boxShadow: `0 0 30px ${palette.primary}80`,
              color: palette.text
            }}
          >
            <Typography variant="h4" sx={{ 
              color: palette.primary, 
              mb: 3, 
              fontFamily: 'monospace',
              textShadow: `0 0 10px ${palette.primary}80`
            }}>
              SIMULATION COMPLETE
            </Typography>
            <Typography sx={{ color: palette.text, fontFamily: 'monospace', fontSize: '1.1rem', mb: 1 }}>
              Total time (ticks): <span style={{ color: palette.secondary, fontWeight: 'bold' }}>{metrics.totalTime}</span>
            </Typography>
            <Typography sx={{ color: palette.text, fontFamily: 'monospace', fontSize: '1.1rem', mb: 1 }}>
              Average time per car: <span style={{ color: palette.secondary, fontWeight: 'bold' }}>{metrics.avgTime.toFixed(1)}</span>
            </Typography>
            <Typography sx={{ color: palette.text, fontFamily: 'monospace', fontSize: '1.1rem' }}>
              Shortest path length: <span style={{ color: palette.secondary, fontWeight: 'bold' }}>{metrics.shortestPath}</span>
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default PathfinderVisualizer;