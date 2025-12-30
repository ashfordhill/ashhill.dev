import React from "react";
import { Paper, Container } from "@mui/material";
import GamePathfinder from "../showcase/pathfinder/GamePathfinder";
import { useAppSelector } from '../../store/hooks';
import { colorPalettes } from '../../store/slices/themeSlice';

const FunSection: React.FC = () => {
  const currentPalette = useAppSelector((state) => state.theme.currentPalette);
  const palette = colorPalettes[currentPalette];

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: { xs: 0.5, sm: 1, md: 1.5 },
        px: { xs: 1, sm: 2, md: 3 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Pathfinder Display */}
      <Paper 
        elevation={4} 
        sx={{ 
          backgroundColor: palette.background + 'F8',
          border: `2px solid ${palette.border}80`,
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: `
            0 0 20px ${palette.border}25,
            inset 0 1px 0 ${palette.primary}20
          `,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          // 3D Depth Effect
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              linear-gradient(135deg, ${palette.primary}05 0%, transparent 50%),
              linear-gradient(-135deg, ${palette.secondary}05 0%, transparent 50%)
            `,
            pointerEvents: 'none',
            zIndex: 1,
          }
        }}
      >
        <GamePathfinder />
      </Paper>
    </Container>
  );
};

export default FunSection;