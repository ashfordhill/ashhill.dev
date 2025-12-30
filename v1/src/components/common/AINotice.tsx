import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { useAppSelector } from '../../store/hooks';
import { colorPalettes } from '../../store/slices/themeSlice';

const AINotice: React.FC = () => {
  const currentPalette = useAppSelector((state) => state.theme.currentPalette);
  const palette = colorPalettes[currentPalette];

  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: palette.background + 'E6',
      backdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${palette.border}40`,
      py: { xs: 0.5, md: 0.75 },
      px: { xs: 1, md: 2 },
    }}>
      <Typography 
        variant="caption" 
        sx={{ 
          color: palette.text + '90',
          fontFamily: 'monospace',
          fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
          textAlign: 'center',
          display: 'block',
          lineHeight: 1.2
        }}
      >
        🧪 This is an experimental sandbox using different AI tools and LLMs. See{' '}
        <Link 
          href="https://github.com/ashfordhill" 
          target="_blank" 
          rel="noopener noreferrer"
          sx={{ 
            color: palette.primary,
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
              color: palette.accent
            }
          }}
        >
          my GitHub
        </Link>
        {' '}for more of my projects
      </Typography>
    </Box>
  );
};

export default AINotice;