import React from 'react';
import { Box } from '@mui/material';
import { GridPosition } from '../data/Grid';
import { CityTile, TileType } from '../data/TileMap';
import { Car } from '../data/Car';

interface TileRendererProps {
  position: GridPosition;
  cityTile: CityTile | null;
  isSpawnPoint: boolean;
  isDestination: boolean;
  isUserObstacle: boolean;
  cellSize: number;
  onClick: (position: GridPosition) => void;
  showMetrics: boolean;
  palette: any;
}

const TileRenderer: React.FC<TileRendererProps> = ({
  position,
  cityTile,
  isSpawnPoint,
  isDestination,
  isUserObstacle,
  cellSize,
  onClick,
  showMetrics,
  palette
}) => {
  const handleClick = () => {
    onClick(position);
  };

  // Determine the tile appearance based on its type and state
  const getTileStyle = () => {
    let backgroundColor = palette.background;
    let border = `1px solid ${palette.border}20`;
    let cursor = 'pointer';
    let content = '';
    let color = palette.text;

    if (isSpawnPoint) {
      backgroundColor = palette.primary + '40';
      border = `2px solid ${palette.primary}`;
      content = 'S';
      color = palette.primary;
    } else if (isDestination) {
      backgroundColor = palette.secondary + '40';
      border = `2px solid ${palette.secondary}`;
      content = 'D';
      color = palette.secondary;
    } else if (isUserObstacle) {
      backgroundColor = '#ff6b35';
      border = `2px solid #ff4500`;
      content = '🚧';
      color = '#fff';
    } else if (cityTile) {
      switch (cityTile.type) {
        case TileType.ROAD:
          backgroundColor = '#4a4a4a';
          border = `1px solid #666`;
          break;
        case TileType.BUILDING:
          backgroundColor = '#8b4513';
          border = `1px solid #654321`;
          content = '🏢';
          cursor = 'not-allowed';
          break;
        case TileType.TREE:
          backgroundColor = '#228b22';
          border = `1px solid #006400`;
          content = '🌳';
          cursor = 'not-allowed';
          break;
        case TileType.GRASS:
          backgroundColor = '#90ee90';
          border = `1px solid #7cfc00`;
          break;
        case TileType.WATER:
          backgroundColor = '#4169e1';
          border = `1px solid #0000cd`;
          content = '💧';
          cursor = 'not-allowed';
          break;
        default:
          backgroundColor = palette.background;
          break;
      }
    }

    return {
      backgroundColor,
      border,
      cursor,
      content,
      color
    };
  };

  const tileStyle = getTileStyle();

  return (
    <Box
      onClick={handleClick}
      sx={{
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        backgroundColor: tileStyle.backgroundColor,
        border: tileStyle.border,
        cursor: tileStyle.cursor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${Math.max(8, cellSize * 0.6)}px`,
        fontWeight: 'bold',
        color: tileStyle.color,
        transition: 'all 0.1s ease',
        userSelect: 'none',
        '&:hover': {
          transform: cityTile?.isObstacle ? 'none' : 'scale(1.05)',
          boxShadow: cityTile?.isObstacle ? 'none' : `0 0 4px ${palette.primary}60`,
        }
      }}
    >
      {tileStyle.content}
    </Box>
  );
};

interface CarRendererProps {
  car: Car;
  cellSize: number;
  palette: any;
}

export const CarRenderer: React.FC<CarRendererProps> = ({
  car,
  cellSize,
  palette
}) => {
  // Calculate the visual position with interpolation
  const x = car.visualPosition.x * cellSize;
  const y = car.visualPosition.y * cellSize;

  // Determine rotation based on direction
  const getRotation = () => {
    switch (car.direction) {
      case 'up': return 'rotate(-90deg)';
      case 'down': return 'rotate(90deg)';
      case 'left': return 'rotate(180deg)';
      case 'right': return 'rotate(0deg)';
      default: return 'rotate(0deg)';
    }
  };

  // Get car color based on ID for variety
  const getCarColor = () => {
    const colors = [
      '#ff4444', // Red
      '#4444ff', // Blue
      '#44ff44', // Green
      '#ffff44', // Yellow
      '#ff44ff', // Magenta
      '#44ffff', // Cyan
    ];
    return colors[car.id % colors.length];
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${Math.max(8, cellSize * 0.8)}px`,
        transform: getRotation(),
        transition: 'transform 0.1s ease',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      <Box
        sx={{
          width: `${cellSize * 0.8}px`,
          height: `${cellSize * 0.6}px`,
          backgroundColor: getCarColor(),
          border: `2px solid #333`,
          borderRadius: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 4px rgba(0,0,0,0.3)`,
        }}
      >
        🚗
      </Box>
    </Box>
  );
};

export default TileRenderer;