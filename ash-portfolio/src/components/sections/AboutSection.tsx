import React from 'react';
import { Box, Typography, Paper, Container } from '@mui/material';
import { useAppSelector } from '../../store/hooks';
import { colorPalettes } from '../../store/slices/themeSlice';

const AboutSection: React.FC = () => {
  const currentPalette = useAppSelector((state) => state.theme.currentPalette);
  const palette = colorPalettes[currentPalette];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={6} 
        sx={{ 
          p: 4, 
          backgroundColor: palette.background + 'E6',
          border: `2px solid ${palette.border}`,
          borderRadius: '12px',
          boxShadow: `0 0 30px ${palette.border}40`,
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography 
          variant="h3" 
          sx={{ 
            color: palette.primary, 
            mb: 3, 
            fontFamily: 'monospace',
            textShadow: `0 0 15px ${palette.primary}80`,
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}
        >
          About Me
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              color: palette.secondary, 
              fontFamily: 'monospace',
              textShadow: `0 0 8px ${palette.secondary}60`
            }}
          >
            Welcome to my digital universe
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: palette.text, 
              fontSize: '1.1rem',
              lineHeight: 1.8,
              fontFamily: 'monospace'
            }}
          >
            I'm a passionate developer who loves creating immersive digital experiences. 
            This portfolio showcases my work in algorithm visualization, interactive simulations, 
            and cutting-edge web technologies.
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: palette.text, 
              fontSize: '1.1rem',
              lineHeight: 1.8,
              fontFamily: 'monospace'
            }}
          >
            My expertise spans across modern web development, data visualization, 
            and creating engaging user interfaces that bring complex algorithms to life. 
            I believe in the power of visual learning and interactive exploration.
          </Typography>

          <Box sx={{ 
            mt: 3, 
            p: 3, 
            border: `1px solid ${palette.accent}`,
            borderRadius: '8px',
            backgroundColor: palette.accent + '10'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: palette.accent, 
                mb: 2,
                fontFamily: 'monospace',
                textShadow: `0 0 5px ${palette.accent}60`
              }}
            >
              Technologies I Love
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: palette.text, 
                fontFamily: 'monospace'
              }}
            >
              React • TypeScript • Next.js • Redux Toolkit • Material-UI • 
              Pixi.js • Algorithm Design • Data Visualization • WebGL
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AboutSection;