import React, { useState, useEffect, useRef } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography, Paper, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { SimulationEngine } from './engine/SimulationEngine';
import { GridPosition } from './data/Grid';
import { Car } from './data/Car';
import { useAppSelector } from '../../../store/hooks';
import { colorPalettes } from '../../../store/slices/themeSlice';
import TileRenderer, { CarRenderer } from './rendering/TileRenderer';

// Icons
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import RefreshIcon from '@mui/icons-material/Refresh';
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

  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Initialize the simulation
  useEffect(() => {
    const engine = engineRef.current;
    
    // Set up callbacks
    engine.setOnTick(() => {
      setCars([...engine.getState().cars]);
      setIsRunning(engine.getState().isRunning);
    });
    
    engine.setOnComplete(() => {
      setIsRunning(false);
      
      // Immediately restart the simulation
      setTimeout(() => {
        if (!engine.getState().isRunning) {
          engine.start();
          setIsRunning(true);
        }
      }, 1000);
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
    engine.start();
    setIsRunning(true);
  }, [algorithm]);

  // Handler for algorithm dropdown change
  const handleAlgorithmChange = (event: any) => {
    const newAlg = event.target.value;
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

  // Handler for resetting obstacles to predefined pattern
  const handleResetObstacles = () => {
    const engine = engineRef.current;
    engine.resetObstacles();
    setGridUpdateTrigger(prev => prev + 1);
  };



  // Handler for clicking on a grid cell
  const handleCellClick = (position: GridPosition) => {    
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

  // Render the grid with city tiles
  const renderGrid = () => {
    const grid = engineRef.current.getState().grid; // Always get fresh grid from engine
    const rows = grid.rows;
    const cols = grid.cols;
    
    // Calculate responsive cell size based on available space
    const maxWidth = typeof window !== 'undefined' ? window.innerWidth * 0.65 : 800; // 65% of screen width for grid
    const maxHeight = typeof window !== 'undefined' ? window.innerHeight * 0.85 : 600; // 85% of screen height for grid
    const cellSizeByWidth = Math.floor((maxWidth - 40) / cols); // Account for padding and sidebar
    const cellSizeByHeight = Math.floor((maxHeight - 40) / rows);
    const cellSize = Math.max(10, Math.min(18, Math.min(cellSizeByWidth, cellSizeByHeight))); // Optimized for viewport fit
    
    return (
      <Box 
        sx={{
          position: 'relative',
          display: 'inline-block',
          backgroundColor: palette.background,
          border: `2px solid ${palette.border}80`,
          borderRadius: '4px',
          padding: { xs: '4px', sm: '6px' },
          boxShadow: `
            0 0 10px ${palette.border}20,
            inset 0 0 20px ${palette.primary}05
          `,
        }}
      >
        {/* Grid tiles */}
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
            gap: '0px', // No gap for seamless tile appearance
            position: 'relative',
          }}
        >
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: cols }).map((_, c) => {
              const position = { row: r, col: c };
              const key = `${r},${c}`;
              
              // Get city tile information
              const cityTile = grid.getCityTile(position);
              
              // Check for special states
              const isSpawnPoint = grid.isSpawnPoint(position);
              const isDestination = grid.isDestination(position);
              
              return (
                <TileRenderer
                  key={key}
                  position={position}
                  cityTile={cityTile}
                  isSpawnPoint={isSpawnPoint}
                  isDestination={isDestination}
                  cellSize={cellSize}
                  onClick={handleCellClick}
                  showMetrics={false}
                  palette={palette}
                />
              );
            })
          )}
        </Box>

        {/* Cars layer - rendered separately for smooth interpolation */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: '4px', sm: '6px' },
            left: { xs: '4px', sm: '6px' },
            pointerEvents: 'none',
          }}
        >
          {cars.map((car) => (
            <CarRenderer
              key={car.id}
              car={car}
              cellSize={cellSize}
              palette={palette}
            />
          ))}
        </Box>

        {/* Subtle overlay effect for city atmosphere */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(
                circle at 30% 30%,
                ${palette.primary}02,
                transparent 50%
              )
            `,
            pointerEvents: 'none',
            borderRadius: '4px',
          }}
        />
      </Box>
    );
  };

  return (
    <Box sx={{ 
      height: '100vh',
      maxHeight: '100vh',
      backgroundColor: palette.background,
      color: palette.text,
      fontFamily: 'monospace',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      zIndex: 2,
    }}>
      {/* Main Content Area */}
      <Box sx={{ 
        display: 'flex', 
        flex: 1,
        height: '100%',
        minHeight: 0
      }}>
        {/* Left Sidebar - Controls and Metrics */}
        <Box sx={{
          width: { xs: '240px', sm: '260px', md: '280px' },
          p: { xs: 1.5, sm: 2, md: 2.5 },
          borderRight: `2px solid ${palette.border}80`,
          backgroundColor: palette.background,
          boxShadow: `2px 0 8px ${palette.border}25`,
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 1.5, sm: 2, md: 2.5 },
          overflow: 'hidden'
        }}>
          {/* Algorithm Section */}
          <Box sx={{
            border: `2px solid ${palette.border}80`,
            borderRadius: '8px',
            p: { xs: 1, sm: 1.5 },
            boxShadow: `0 0 8px ${palette.border}25`,
            flex: '0 0 auto'
          }}>
            <Typography variant="h6" sx={{ 
              color: palette.secondary, 
              mb: 2, 
              fontFamily: 'monospace',
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
              textShadow: `0 0 3px ${palette.secondary}60`
            }}>
              ALGORITHM
            </Typography>
            
            <FormControl fullWidth>
              <Select
                value={algorithm}
                onChange={handleAlgorithmChange}
                sx={{
                  color: palette.text,
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: palette.secondary + '80',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: palette.secondary,
                    boxShadow: `0 0 8px ${palette.secondary}40`
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: palette.secondary,
                    boxShadow: `0 0 12px ${palette.secondary}60`
                  },
                  '& .MuiSelect-icon': {
                    color: palette.secondary,
                  },
                  backgroundColor: palette.background + '40',
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: palette.background,
                      border: `2px solid ${palette.secondary}80`,
                      borderRadius: '8px',
                      boxShadow: `0 0 20px ${palette.secondary}40`,
                      '& .MuiMenuItem-root': {
                        color: palette.text,
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        '&:hover': {
                          backgroundColor: palette.secondary + '20',
                        },
                        '&.Mui-selected': {
                          backgroundColor: palette.secondary + '40',
                          '&:hover': {
                            backgroundColor: palette.secondary + '60',
                          }
                        }
                      }
                    }
                  }
                }}
              >
                {engineRef.current.getAvailableAlgorithms().map((alg) => (
                  <MenuItem key={alg} value={alg}>
                    {alg}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Controls Section */}
          <Box sx={{
            border: `2px solid ${palette.border}80`,
            borderRadius: '8px',
            p: { xs: 1, sm: 1.5 },
            boxShadow: `0 0 8px ${palette.border}25`,
            flex: '0 0 auto'
          }}>
            <Typography variant="h6" sx={{ 
              color: palette.secondary, 
              mb: 2, 
              fontFamily: 'monospace',
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
              textShadow: `0 0 3px ${palette.secondary}60`
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

              {/* Reset Obstacles Button */}
              <Button
                variant="outlined"
                onClick={handleResetObstacles}
                startIcon={<RefreshIcon />}
                sx={{
                  color: palette.secondary,
                  backgroundColor: 'transparent',
                  borderColor: palette.secondary,
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  '&:hover': {
                    backgroundColor: palette.secondary + '20',
                    boxShadow: `0 0 8px ${palette.secondary}60`
                  }
                }}
              >
                RESET OBSTACLES
              </Button>
            </Box>
          </Box>

          {/* Metrics Section - Smaller */}
          <Box sx={{
            border: `2px solid ${palette.border}80`,
            borderRadius: '8px',
            p: { xs: 1, sm: 1.5 },
            boxShadow: `0 0 8px ${palette.border}25`,
            flex: '0 0 auto'
          }}>
            <Typography variant="h6" sx={{ 
              color: palette.secondary, 
              mb: 1, 
              fontFamily: 'monospace',
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
              textShadow: `0 0 3px ${palette.secondary}60`
            }}>
              METRICS
            </Typography>
            
            <Typography sx={{ 
              color: palette.text, 
              fontFamily: 'monospace',
              fontSize: { xs: '0.8rem', sm: '0.9rem' }
            }}>
              <span style={{ color: palette.accent }}>Cars En Route:</span>{' '}
              <span style={{ color: palette.primary, fontSize: '1.1rem', fontWeight: 'bold' }}>
                {cars.length}
              </span>
            </Typography>
          </Box>
        </Box>

        {/* Right Side - Grid Display */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 1, sm: 1.5, md: 2 },
          backgroundColor: palette.background,
          overflow: 'hidden',
          position: 'relative'
        }}>
          <Box sx={{
            maxWidth: '100%',
            maxHeight: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {renderGrid()}
          </Box>
        </Box>
      </Box>


    </Box>
  );
};

export default PathfinderVisualizer;