import React from 'react';
import { Box } from '@mui/material';
import { useAppSelector } from '../store/hooks';
import AboutSection from './sections/AboutSection';
import FunSection from './sections/FunSection';
import HealthSection from './sections/HealthSection';

const MainContent: React.FC = () => {
  const currentSection = useAppSelector((state) => state.navigation.currentSection);

  const renderSection = () => {
    switch (currentSection) {
      case 'about':
        return <AboutSection />;
      case 'fun':
        return <FunSection />;
      case 'health':
        return <HealthSection />;
      default:
        return <FunSection />;
    }
  };

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 80px)',
      py: 2,
    }}>
      {renderSection()}
    </Box>
  );
};

export default MainContent;