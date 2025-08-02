import React from 'react';
import { Box } from '@mui/material';
import { CityTile, TileType, getTilePath, TILE_INDICES, getRandomTile } from '../data/TileMap';
import { GridPosition } from '../data/Grid';
import { Car } from '../data/Car';

interface TileRendererProps {
  position: GridPosition;
  cityTile: CityTile | null;
  isSpawnPoint: boolean;
  isDestination: boolean;
  cellSize: number;
  onClick: (position: GridPosition) => void;
  showMetrics: boolean;
  palette: any;
}

interface CarRendererProps {
  car: Car;
  cellSize: number;
  palette: any;
}

const TileRenderer: React.FC<TileRendererProps> = ({
  position,
  cityTile,
  isSpawnPoint,
  isDestination,
  cellSize,
  onClick,
  showMetrics,
  palette
}) => {
  // Determine what to render
  let backgroundImage = '';
  let overlayContent: string | null = null;
  let overlayColor = 'transparent';
  let glowColor = 'transparent';
  let cursor = showMetrics ? 'default' : 'crosshair';

  // Base tile (road, grass, etc.)
  if (cityTile) {
    backgroundImage = getTilePath(cityTile.tileIndex);
  }

  // Special overlays for spawn points and destinations
  if (isSpawnPoint) {
    overlayColor = palette.spawn + '30';
    glowColor = palette.spawn + '40';
    overlayContent = '🏁'; // Start flag
  }

  if (isDestination) {
    overlayColor = palette.destination + '30';
    glowColor = palette.destination + '40';
    overlayContent = '🎯'; // Target
  }

  return (
    <Box
      onClick={() => onClick(position)}
      sx={{
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        position: 'relative',
        cursor,
        transition: 'all 0.1s ease',
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: !backgroundImage ? palette.grid : 'transparent',
        border: `1px solid ${palette.border}40`,
        boxShadow: glowColor !== 'transparent' ? `0 0 3px ${glowColor}` : 'none',
        '&:hover': {
          boxShadow: showMetrics 
            ? (glowColor !== 'transparent' ? `0 0 3px ${glowColor}` : 'none')
            : `0 0 4px ${palette.primary}60`,
          transform: showMetrics ? 'none' : 'scale(1.05)',
        }
      }}
    >
      {/* Overlay for special states */}
      {overlayColor !== 'transparent' && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: overlayColor,
            borderRadius: '2px',
            pointerEvents: 'none',
          }}
        />
      )}
      
      {/* Content overlay (spawn, destination, car icons) */}
      {overlayContent && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${Math.max(8, cellSize * 0.6)}px`,
            fontWeight: 'bold',
            color: palette.text,
            textShadow: `0 0 2px ${palette.background}`,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          {overlayContent}
        </Box>
      )}
    </Box>
  );
};

// Separate component for rendering cars with smooth interpolation
const CarRenderer: React.FC<CarRendererProps> = ({ car, cellSize, palette }) => {
  // Calculate rotation based on direction
  const getRotation = (direction: string): number => {
    switch (direction) {
      case 'up': return -90;
      case 'down': return 90;
      case 'left': return 180;
      case 'right': return 0;
      default: return 0;
    }
  };

  // Get car sprite tile index based on car ID (for variety)
  const getCarTileIndex = (carId: number): number => {
    const carTiles = [
      TILE_INDICES.SPECIAL.CAR_RED[0],
      TILE_INDICES.SPECIAL.CAR_BLUE[0], 
      TILE_INDICES.SPECIAL.CAR_GREEN[0],
      TILE_INDICES.SPECIAL.CAR_YELLOW[0]
    ];
    return carTiles[carId % carTiles.length];
  };

  const carTileIndex = getCarTileIndex(car.id);
  const carImagePath = getTilePath(carTileIndex);

  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${car.visualPosition.x * cellSize}px`,
        top: `${car.visualPosition.y * cellSize}px`,
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        backgroundImage: `url(${carImagePath})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        transform: `rotate(${getRotation(car.direction)}deg)`,
        transition: 'transform 0.2s ease',
        zIndex: 100,
        pointerEvents: 'none',
        filter: `drop-shadow(0 0 2px ${palette.primary}80)`,
      }}
    />
  );
};

export default TileRenderer;
export { CarRenderer };