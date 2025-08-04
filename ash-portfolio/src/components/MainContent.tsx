import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useAppSelector } from '../store/hooks';
import { colorPalettes } from '../store/slices/themeSlice';
import AboutSection from './sections/AboutSection';
import FunSection from './sections/FunSection';
import HealthSection from './sections/HealthSection';
import SimpleMusicPlayer from './sections/SimpleMusicPlayer';

const MainContent: React.FC = () => {
  const currentSection = useAppSelector((state) => state.navigation.currentSection);
  const currentPalette = useAppSelector((state) => state.theme.currentPalette);
  const previousSectionRef = useRef(currentSection);

  // Force cleanup when section changes
  useEffect(() => {
    if (previousSectionRef.current !== currentSection) {
      // Small delay to allow current section to fully unmount before mounting new one
      const timeoutId = setTimeout(() => {
        previousSectionRef.current = currentSection;
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentSection]);

  const renderSection = () => {
    // Only render the current section to ensure proper cleanup
    switch (currentSection) {
      case 'about':
        return <AboutSection key="about" />;
      case 'fun':
        return <FunSection key="fun" />;
      case 'health':
        return <HealthSection key="health" />;
      case 'music':
        return <SimpleMusicPlayer key="music" />;
      default:
        return <FunSection key="fun-default" />;
    }
  };

  return (
    <Box sx={{ 
      height: 'calc(90vh - 70px)',
      py: { xs: 1, sm: 1.5, md: 2 },
      display: 'flex',
      flexDirection: 'column',
    }}>
      {renderSection()}
    </Box>
  );
};

export default MainContent;