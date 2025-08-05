import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useAppSelector } from '../store/hooks';
import { colorPalettes } from '../store/slices/themeSlice';
import AboutSection from './sections/AboutSection';
import FunSection from './sections/FunSection';
import CicdDashboardSection from './sections/CicdDashboardSection';
import SimpleMusicPlayer from './sections/SimpleMusicPlayer';

const MainContent: React.FC = () => {
  const currentSection = useAppSelector((state) => state.navigation.currentSection);
  const currentPalette = useAppSelector((state) => state.theme.currentPalette);
  const previousSectionRef = useRef(currentSection);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Force cleanup when section changes
  useEffect(() => {
    if (previousSectionRef.current !== currentSection) {
      console.log(`Section changing from ${previousSectionRef.current} to ${currentSection}`);
      
      // Set transitioning state to prevent rendering during cleanup
      setIsTransitioning(true);
      
      // Allow time for cleanup before mounting new section
      const timeoutId = setTimeout(() => {
        previousSectionRef.current = currentSection;
        setIsTransitioning(false);
        console.log(`Section transition completed: ${currentSection}`);
      }, 150); // Increased delay for better cleanup
      
      return () => {
        clearTimeout(timeoutId);
        setIsTransitioning(false);
      };
    }
  }, [currentSection]);

  const renderSection = () => {
    // Don't render during transitions to ensure proper cleanup
    if (isTransitioning) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          opacity: 0.5 
        }}>
          {/* Optional: Add a loading indicator here */}
        </Box>
      );
    }

    // Only render the current section to ensure proper cleanup
    switch (currentSection) {
      case 'about':
        return <AboutSection key={`about-${Date.now()}`} />;
      case 'fun':
        return <FunSection key={`fun-${Date.now()}`} />;
      case 'cicd':
        return <CicdDashboardSection key={`cicd-${Date.now()}`} />;
      case 'music':
        return <SimpleMusicPlayer key={`music-${Date.now()}`} />;
      default:
        return <FunSection key={`fun-default-${Date.now()}`} />;
    }
  };

  return (
    <Box sx={{ 
      height: { 
        xs: 'calc(100vh - 120px)', // Mobile: account for smaller nav
        sm: 'calc(100vh - 140px)',  // Tablet: account for medium nav
        md: 'calc(100vh - 160px)'   // Desktop: account for full nav
      },
      minHeight: { xs: '400px', md: '500px' }, // Ensure minimum usable height
      maxHeight: '100vh', // Prevent overflow
      py: { xs: 0.5, sm: 1, md: 1.5 },
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {renderSection()}
    </Box>
  );
};

export default MainContent;