import React from "react";
import { Paper, Container } from "@mui/material";
import PathfinderVisualizer from "../showcase/pathfinder/PathfinderVisualizer";
import { useAppSelector } from '../../store/hooks';
import { colorPalettes } from '../../store/slices/themeSlice';

const FunSection: React.FC = () => {
  const currentPalette = useAppSelector((state) => state.theme.currentPalette);
  const palette = colorPalettes[currentPalette];

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Pathfinder Display */}
      <Paper 
        elevation={6} 
        sx={{ 
          backgroundColor: palette.background,
          border: `2px solid ${palette.border}`,
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: `0 0 30px ${palette.border}40`
        }}
      >
        <PathfinderVisualizer />
      </Paper>
    </Container>
  );
};

export default FunSection;