import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useAppSelector } from '../store/hooks';
import AboutSection from './sections/AboutSection';
import FunSection from './sections/FunSection';
import CicdDashboardSection from './sections/CicdDashboardSection';
import SimpleMusicPlayer from './sections/SimpleMusicPlayer';
import useIsMobile from '../hooks/useIsMobile';

const MainContent: React.FC = () => {
  const currentSection = useAppSelector((state) => state.navigation.currentSection);
  const previousSectionRef = useRef(currentSection);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isMobile = useIsMobile();

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
    // Mobile-first approach: On mobile devices, always show About section
    // This provides a clean, focused experience since other components
    // (pathfinder, CICD, music) don't render well on small screens
    if (isMobile) {
      return <AboutSection key={`about-mobile-${Date.now()}`} />;
    }

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

    // Only render the current section to ensure proper cleanup (desktop only)
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
        return <AboutSection key={`about-default-${Date.now()}`} />;
    }
  };

  return (
    <Box sx={{ 
      height: isMobile ? {
        xs: 'calc(100vh - 68px)', // Mobile: AI notice (28px) + padding (40px)
        sm: 'calc(100vh - 92px)',  // Small mobile: AI notice (32px) + padding (60px)
      } : { 
        xs: 'calc(100vh - 156px)', // Mobile: AI notice (36px) + nav (120px)
        sm: 'calc(100vh - 172px)',  // Tablet: AI notice (32px) + nav (140px)
        md: 'calc(100vh - 196px)'   // Desktop: AI notice (36px) + nav (160px)
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