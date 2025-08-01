import React, { useState } from 'react';
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

  const handleSectionChange = (section: NavigationSection) => {
    dispatch(setCurrentSection(section));
  };

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
    { key: 'fun', label: 'PATHFINDER' },
    { key: 'health', label: 'HEALTH' },
  ];

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      p: 3,
      borderBottom: `3px solid ${palette.border}`,
      background: `
        linear-gradient(135deg, ${palette.background}E6 0%, ${palette.primary}15 25%, ${palette.secondary}10 50%, ${palette.primary}15 75%, ${palette.background}E6 100%),
        linear-gradient(90deg, transparent 0%, ${palette.border}20 50%, transparent 100%)
      `,
      boxShadow: `
        0 4px 20px ${palette.border}60,
        inset 0 1px 0 ${palette.primary}40,
        inset 0 -1px 0 ${palette.secondary}40
      `,
      position: 'relative',
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 50%, ${palette.primary}10 0%, transparent 50%),
          radial-gradient(circle at 80% 50%, ${palette.secondary}10 0%, transparent 50%)
        `,
        pointerEvents: 'none',
        zIndex: -1,
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
              fontSize: '1.3rem',
              textShadow: currentSection === item.key 
                ? `0 0 15px ${palette.primary}` 
                : `0 0 8px ${palette.text}40`,
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              px: 3,
              py: 1.5,
              border: currentSection === item.key 
                ? `2px solid ${palette.primary}80` 
                : `2px solid transparent`,
              borderRadius: '12px',
              background: currentSection === item.key 
                ? `linear-gradient(135deg, ${palette.primary}20 0%, ${palette.secondary}10 100%)`
                : 'transparent',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: `linear-gradient(90deg, transparent, ${palette.primary}40, transparent)`,
                transition: 'left 0.6s ease',
              },
              '&:hover': {
                color: palette.primary,
                textShadow: `0 0 20px ${palette.primary}`,
                transform: 'translateY(-2px) scale(1.05)',
                borderColor: palette.primary,
                background: `linear-gradient(135deg, ${palette.primary}30 0%, ${palette.secondary}20 100%)`,
                boxShadow: `0 8px 25px ${palette.primary}40`,
                '&::before': {
                  left: '100%',
                }
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
            fontSize: '1.1rem',
            textTransform: 'uppercase',
            border: `2px solid ${palette.primary}40`,
            borderRadius: '8px',
            px: 2,
            py: 1,
            textShadow: `0 0 8px ${palette.primary}60`,
            '&:hover': {
              color: palette.accent,
              borderColor: palette.accent,
              backgroundColor: palette.accent + '10',
              transform: 'scale(1.05)',
              boxShadow: `0 0 15px ${palette.accent}60`
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