import React, { useState, useEffect, useRef } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography, Paper, Tooltip } from '@mui/material';
import { SimulationEngine, SimulationMetrics } from './engine/SimulationEngine';
import { Grid, GridPosition } from './data/Grid';
import { Car } from './data/Car';

// Icons
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import StarIcon from '@mui/icons-material/Star';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const PathfinderVisualizer: React.FC = () => {
  // Engine instance
  const engineRef = useRef<SimulationEngine>(new SimulationEngine());
  
  // UI state
  const [cars, setCars] = useState<Car[]>([]);
  const [grid, setGrid] = useState<Grid>(engineRef.current.getState().grid);
  const [algorithm, setAlgorithm] = useState<string>('BFS');
  const [tool, setTool] = useState<string>('add');
  const [showMetrics, setShowMetrics] = useState<boolean>(false);
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
    });
    
    engine.setOnComplete((simulationMetrics) => {
      setMetrics(simulationMetrics);
      setShowMetrics(true);
      
      // After a brief pause, restart the simulation
      setTimeout(() => {
        if (!engine.getState().isRunning) {
          setShowMetrics(false);
          engine.start();
        }
      }, 3000);
    });
    
    // Start the simulation
    engine.start();
    
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
    
    // Update the grid state - use the actual grid instance
    setGrid(engine.getState().grid);
  };

  // Render the grid
  const renderGrid = () => {
    const rows = grid.rows;
    const cols = grid.cols;
    
    return (
      <Box 
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 20px)`,
          gridTemplateRows: `repeat(${rows}, 20px)`,
          gap: '1px',
          backgroundColor: '#999'
        }}
      >
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => {
            const position = { row: r, col: c };
            const key = `${r},${c}`;
            let bgColor = '#fff';  // default empty cell color
            let cellIcon = null;
            
            // Check if this cell is an obstacle
            if (grid.isObstacle(position)) {
              bgColor = '#444';  // obstacle color
            }
            
            // Check if this cell is the destination
            if (grid.isDestination(position)) {
              if (grid.isObstacle(position)) {
                bgColor = '#fff';  // ensure destination is never an obstacle
              }
              
              // Check if a car is at the destination
              const carAtDest = cars.find(car => 
                car.position.row === r && car.position.col === c
              );
              
              if (carAtDest) {
                cellIcon = <DirectionsCarIcon sx={{ color: 'blue', fontSize: '1rem' }} />;
              } else {
                cellIcon = <StarIcon sx={{ color: 'green', fontSize: '1rem' }} />;
              }
            }
            
            // Check if a car is in this cell (not at destination)
            const carHere = cars.find(car => 
              car.position.row === r && 
              car.position.col === c && 
              !grid.isDestination(position)
            );
            
            if (carHere) {
              bgColor = 'transparent';
              cellIcon = <DirectionsCarIcon sx={{ color: 'blue', fontSize: '1rem' }} />;
            }
            
            return (
              <Box 
                key={key}
                onClick={() => handleCellClick(position)}
                sx={{
                  width: '20px', 
                  height: '20px',
                  backgroundColor: bgColor,
                  border: '1px solid #ccc',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  cursor: showMetrics ? 'default' : 'pointer'
                }}
              >
                {cellIcon}
              </Box>
            );
          })
        )}
      </Box>
    );
  };

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
      {renderGrid()}

      {/* Metrics Overlay (shown when simulation ends) */}
      {showMetrics && (
        <Paper 
          elevation={6} 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            padding: 2, 
            minWidth: '250px', 
            textAlign: 'center'
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
};

export default PathfinderVisualizer;