import React from 'react';
import { Provider } from 'react-redux';
import { Box } from '@mui/material';
import { store } from '../store';
import TopNavigation from './navigation/TopNavigation';
import MainContent from './MainContent';
import { useAppSelector } from '../store/hooks';
import { colorPalettes } from '../store/slices/themeSlice';

const AppContent: React.FC = () => {
  const currentPalette = useAppSelector((state) => state.theme.currentPalette);
  const palette = colorPalettes[currentPalette];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `
        linear-gradient(180deg, ${palette.primary}08 0%, transparent 15%),
        linear-gradient(0deg, ${palette.secondary}06 0%, transparent 15%),
        linear-gradient(135deg, ${palette.background} 0%, #000000 50%, #0a0a0f 100%)
      `,
      position: 'relative',
      overflow: 'hidden',
      // 3D Perspective Grid Lines
      '&::before': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          linear-gradient(90deg, transparent 0%, ${palette.primary}15 2%, transparent 4%),
          linear-gradient(90deg, transparent 10%, ${palette.primary}10 12%, transparent 14%),
          linear-gradient(90deg, transparent 20%, ${palette.primary}08 22%, transparent 24%),
          linear-gradient(90deg, transparent 30%, ${palette.primary}06 32%, transparent 34%),
          linear-gradient(90deg, transparent 70%, ${palette.primary}06 72%, transparent 74%),
          linear-gradient(90deg, transparent 80%, ${palette.primary}08 82%, transparent 84%),
          linear-gradient(90deg, transparent 90%, ${palette.primary}10 92%, transparent 94%),
          linear-gradient(90deg, transparent 96%, ${palette.primary}15 98%, transparent 100%)
        `,
        transform: 'perspective(1000px) rotateX(60deg)',
        transformOrigin: 'bottom',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.3,
      },
      // Perspective Side Lines
      '&::after': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          linear-gradient(45deg, transparent 0%, ${palette.secondary}20 1%, transparent 2%),
          linear-gradient(-45deg, transparent 0%, ${palette.secondary}20 1%, transparent 2%),
          linear-gradient(45deg, transparent 98%, ${palette.secondary}20 99%, transparent 100%),
          linear-gradient(-45deg, transparent 98%, ${palette.secondary}20 99%, transparent 100%)
        `,
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.4,
      },
      '& > *': {
        position: 'relative',
        zIndex: 10,
      }
    }}>
      {/* Top Banner Area */}
      <Box sx={{
        height: '60px',
        background: `
          linear-gradient(90deg, 
            ${palette.primary}20 0%, 
            ${palette.secondary}15 25%, 
            ${palette.accent}10 50%, 
            ${palette.secondary}15 75%, 
            ${palette.primary}20 100%
          )
        `,
        borderBottom: `2px solid ${palette.primary}40`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        '&::before': {
          content: '"◆ NEURAL PATHFINDING INTERFACE ◆"',
          color: palette.primary,
          fontFamily: 'monospace',
          fontSize: '14px',
          fontWeight: 'bold',
          textShadow: `0 0 10px ${palette.primary}60`,
          letterSpacing: '3px',
        }
      }} />

      {/* Main Content Container */}
      <Box sx={{ 
        maxWidth: { xs: '95%', sm: '90%', md: '85%', lg: '80%' },
        mx: 'auto',
        minHeight: 'calc(100vh - 60px)',
        pt: 2,
        pb: 2,
        position: 'relative',
        // 3D Depth Effect
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-50px',
          right: '-50px',
          bottom: 0,
          background: `
            linear-gradient(90deg, 
              ${palette.primary}05 0%, 
              transparent 10%, 
              transparent 90%, 
              ${palette.primary}05 100%
            )
          `,
          transform: 'perspective(800px) rotateY(-2deg)',
          pointerEvents: 'none',
          zIndex: -1,
        }
      }}>
        <TopNavigation />
        <MainContent />
      </Box>

      {/* Floating Geometric Elements */}
      <Box sx={{
        position: 'fixed',
        top: '20%',
        left: '5%',
        width: '100px',
        height: '100px',
        background: `linear-gradient(45deg, ${palette.primary}20, ${palette.secondary}15)`,
        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
        animation: 'float 6s ease-in-out infinite',
        zIndex: 2,
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
        }
      }} />

      <Box sx={{
        position: 'fixed',
        top: '60%',
        right: '8%',
        width: '80px',
        height: '80px',
        background: `linear-gradient(135deg, ${palette.accent}25, ${palette.primary}15)`,
        clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
        animation: 'float 8s ease-in-out infinite reverse',
        zIndex: 2,
      }} />
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;