import React from 'react';
import { Box } from '@mui/material';
import { useAppSelector } from '../store/hooks';
import { colorPalettes } from '../store/slices/themeSlice';
import AboutSection from './sections/AboutSection';
import FunSection from './sections/FunSection';
import HealthSection from './sections/HealthSection';
import MusicSection from './sections/MusicSection';

const MainContent: React.FC = () => {
  const currentSection = useAppSelector((state) => state.navigation.currentSection);
  const currentPalette = useAppSelector((state) => state.theme.currentPalette);
  const palette = colorPalettes[currentPalette];

  const renderSection = () => {
    switch (currentSection) {
      case 'about':
        return <AboutSection />;
      case 'fun':
        return <FunSection />;
      case 'health':
        return <HealthSection />;
      case 'music':
        return <MusicSection />;
      default:
        return <FunSection />;
    }
  };

  return (
    <Box sx={{ 
      height: 'calc(100vh - 120px)',
      py: { xs: 1, sm: 1.5, md: 2 },
      display: 'flex',
      flexDirection: 'column',
    }}>
      {renderSection()}
    </Box>
  );
};

export default MainContent;