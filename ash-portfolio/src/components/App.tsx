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
        radial-gradient(ellipse 800px 600px at 20% 30%, ${palette.primary}20 0%, transparent 50%),
        radial-gradient(ellipse 600px 400px at 80% 70%, ${palette.secondary}15 0%, transparent 50%),
        radial-gradient(ellipse 400px 300px at 60% 20%, ${palette.accent}12 0%, transparent 50%),
        radial-gradient(ellipse 500px 350px at 10% 80%, ${palette.primary}08 0%, transparent 50%),
        linear-gradient(135deg, ${palette.background} 0%, #000000 30%, #0a0a0f 70%, ${palette.background}90 100%)
      `,
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(1px 1px at 25px 35px, ${palette.text}60, transparent),
          radial-gradient(1px 1px at 85px 15px, ${palette.primary}50, transparent),
          radial-gradient(2px 2px at 150px 80px, ${palette.secondary}40, transparent),
          radial-gradient(1px 1px at 200px 45px, ${palette.accent}50, transparent),
          radial-gradient(1px 1px at 300px 120px, ${palette.text}40, transparent),
          radial-gradient(2px 2px at 350px 25px, ${palette.primary}30, transparent),
          radial-gradient(1px 1px at 450px 90px, ${palette.secondary}50, transparent)
        `,
        backgroundRepeat: 'repeat',
        backgroundSize: '500px 200px',
        animation: 'galaxyTwinkle 25s linear infinite',
        pointerEvents: 'none',
        zIndex: 1,
      },
      '&::after': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(3px 3px at 100px 50px, ${palette.primary}20, transparent),
          radial-gradient(2px 2px at 250px 150px, ${palette.secondary}25, transparent),
          radial-gradient(4px 4px at 400px 100px, ${palette.accent}15, transparent)
        `,
        backgroundRepeat: 'repeat',
        backgroundSize: '600px 300px',
        animation: 'galaxyTwinkle 35s linear infinite reverse',
        pointerEvents: 'none',
        zIndex: 1,
      },
      '& > *': {
        position: 'relative',
        zIndex: 2,
      },
      '@keyframes galaxyTwinkle': {
        '0%': { 
          transform: 'translateY(0px) translateX(0px)',
          opacity: 0.8
        },
        '25%': { 
          opacity: 1
        },
        '50%': { 
          transform: 'translateY(-50px) translateX(20px)',
          opacity: 0.6
        },
        '75%': { 
          opacity: 1
        },
        '100%': { 
          transform: 'translateY(-100px) translateX(0px)',
          opacity: 0.8
        },
      }
    }}>
      <TopNavigation />
      <MainContent />
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