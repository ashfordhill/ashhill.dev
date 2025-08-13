import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Menu, 
  MenuItem
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setCurrentSection, NavigationSection } from '../../store/slices/navigationSlice';
import { setPalette, colorPalettes, PaletteKey } from '../../store/slices/themeSlice';

const TopNavigation: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentSection = useAppSelector((state) => state.navigation.currentSection);
  const currentPalette = useAppSelector((state) => state.theme.currentPalette);
  const palette = colorPalettes[currentPalette];

  const [paletteMenuAnchor, setPaletteMenuAnchor] = useState<null | HTMLElement>(null);

  // Debounced navigation to prevent rapid switching
  const handleSectionChange = useCallback((section: NavigationSection) => {
    if (section !== currentSection) {
      dispatch(setCurrentSection(section));
    }
  }, [dispatch, currentSection]);

  const handlePaletteMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setPaletteMenuAnchor(event.currentTarget);
  };

  const handlePaletteMenuClose = () => {
    setPaletteMenuAnchor(null);
  };

  const handlePaletteChange = (paletteKey: PaletteKey) => {
    dispatch(setPalette(paletteKey));
    handlePaletteMenuClose();
  };

  const navigationItems: { key: NavigationSection; label: string }[] = [
    { key: 'about', label: 'ABOUT' },
    { key: 'llm-drama', label: 'LLM DRAMA' },
    { key: 'fun', label: 'PATHFINDER' },
    { key: 'cicd', label: 'CI/CD' },
    { key: 'music', label: 'MUSIC' },
  ];

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      p: { xs: 2, sm: 2.5, md: 3 },
      mb: { xs: 1, sm: 2 },
      borderRadius: '12px',
      border: `2px solid ${palette.border}60`,
      background: `
        linear-gradient(135deg, ${palette.background}F0 0%, ${palette.primary}08 25%, ${palette.secondary}06 50%, ${palette.primary}08 75%, ${palette.background}F0 100%)
      `,
      boxShadow: `
        0 2px 15px ${palette.border}30,
        inset 0 1px 0 ${palette.primary}20,
        inset 0 -1px 0 ${palette.secondary}20
      `,
      position: 'relative',
      zIndex: 1000,
      backdropFilter: 'blur(8px)',
      // Cyberpunk corner accents
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '8px',
        left: '8px',
        width: '20px',
        height: '20px',
        border: `2px solid ${palette.primary}80`,
        borderRight: 'none',
        borderBottom: 'none',
        borderRadius: '4px 0 0 0',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '8px',
        right: '8px',
        width: '20px',
        height: '20px',
        border: `2px solid ${palette.secondary}80`,
        borderLeft: 'none',
        borderTop: 'none',
        borderRadius: '0 0 4px 0',
      }
    }}>
      {/* Left side - Navigation */}
      <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {navigationItems.map((item) => (
          <Button
            key={item.key}
            onClick={() => handleSectionChange(item.key)}
            sx={{
              color: currentSection === item.key ? palette.primary : palette.text,
              fontWeight: 'bold',
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
              textShadow: currentSection === item.key 
                ? `0 0 8px ${palette.primary}60` 
                : `0 0 4px ${palette.text}30`,
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              px: { xs: 2, sm: 2.5, md: 3 },
              py: { xs: 1, sm: 1.2, md: 1.5 },
              border: currentSection === item.key 
                ? `2px solid ${palette.primary}60` 
                : `2px solid transparent`,
              borderRadius: '8px',
              background: currentSection === item.key 
                ? `linear-gradient(135deg, ${palette.primary}15 0%, ${palette.secondary}08 100%)`
                : 'transparent',
              transition: 'all 0.3s ease',
              '&:hover': {
                color: palette.primary,
                textShadow: `0 0 10px ${palette.primary}80`,
                transform: 'translateY(-1px)',
                borderColor: palette.primary + '80',
                background: `linear-gradient(135deg, ${palette.primary}20 0%, ${palette.secondary}12 100%)`,
                boxShadow: `0 4px 15px ${palette.primary}25`,
              }
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>

      {/* Right side - Palette Selector */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          onClick={handlePaletteMenuOpen}
          startIcon={<PaletteIcon />}
          sx={{
            color: palette.primary,
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
            textTransform: 'uppercase',
            border: `2px solid ${palette.primary}50`,
            borderRadius: '8px',
            px: { xs: 1.5, sm: 2 },
            py: { xs: 0.8, sm: 1 },
            textShadow: `0 0 5px ${palette.primary}40`,
            '&:hover': {
              color: palette.accent,
              borderColor: palette.accent + '80',
              backgroundColor: palette.accent + '08',
              transform: 'translateY(-1px)',
              boxShadow: `0 2px 10px ${palette.accent}30`
            }
          }}
        >
          {palette.name}
        </Button>

        <Menu
          anchorEl={paletteMenuAnchor}
          open={Boolean(paletteMenuAnchor)}
          onClose={handlePaletteMenuClose}
          PaperProps={{
            sx: {
              backgroundColor: palette.background,
              border: `2px solid ${palette.border}`,
              boxShadow: `0 0 20px ${palette.border}60`,
            }
          }}
        >
          {Object.entries(colorPalettes).map(([key, pal]) => (
            <MenuItem 
              key={key} 
              onClick={() => handlePaletteChange(key as PaletteKey)}
              sx={{ 
                color: palette.text, 
                backgroundColor: 'transparent',
                fontFamily: 'monospace',
                '&:hover': {
                  backgroundColor: palette.primary + '20',
                  color: palette.primary,
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box 
                  sx={{ 
                    width: 20, 
                    height: 20, 
                    backgroundColor: pal.primary,
                    borderRadius: '50%',
                    boxShadow: `0 0 8px ${pal.primary}60`
                  }} 
                />
                {pal.name}
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Box>
  );
};

export default TopNavigation;