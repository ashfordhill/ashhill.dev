import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Container, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import { useAppSelector } from '../store/hooks';
import { colorPalettes } from '../store/slices/themeSlice';

const About: React.FC = () => {
  const currentPalette = useAppSelector((state) => state.theme.currentPalette);
  const palette = colorPalettes[currentPalette];
  
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [blinkCursor, setBlinkCursor] = useState(true);

  // Terminal content - customize these lines!
  const terminalContent = [
    "> whoami",
    "Ashley Foster - Software Engineer",
    "> cat skills.txt",
    "React • TypeScript • Next.js • Material UI • Pixi.js • Algorithm Design",
    "> cat interests.txt",
    "Interactive visualizations • Pathfinding algorithms • Neon aesthetics • Retro vibes",
    "> ./experience.sh",
    "Loading professional background...",
    "✓ Frontend Developer - Building responsive UIs and interactive experiences",
    "✓ Algorithm Enthusiast - Optimizing complex problems with elegant solutions",
    "✓ Creative Coder - Blending technology with visual design",
    "> echo $CURRENT_PROJECT",
    "Pathfinding visualizer with traffic simulation capabilities",
    "> contact --info",
    "GitHub: github.com/yourusername",
    "Email: your.email@example.com",
    "> _"
  ];

  // Typewriter effect
  useEffect(() => {
    if (currentLine >= terminalContent.length) return;
    
    const timer = setTimeout(() => {
      if (charIndex < terminalContent[currentLine].length) {
        setCharIndex(charIndex + 1);
      } else {
        setTimeout(() => {
          setCurrentLine(currentLine + 1);
          setCharIndex(0);
        }, 500);
      }
    }, currentLine % 2 === 0 ? 70 : 30); // Commands type slower than responses
    
    return () => clearTimeout(timer);
  }, [currentLine, charIndex]);

  // Update terminal lines as they're "typed"
  useEffect(() => {
    if (currentLine === 0 && charIndex === 0) {
      setTerminalLines([]);
      return;
    }

    const updatedLines = [...terminalLines];
    
    if (currentLine > 0 && charIndex === 0) {
      updatedLines.push(terminalContent[currentLine - 1]);
    } else if (charIndex > 0) {
      updatedLines[currentLine] = terminalContent[currentLine].substring(0, charIndex);
    }
    
    setTerminalLines(updatedLines);
  }, [currentLine, charIndex]);

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setBlinkCursor(prev => !prev);
    }, 500);
    
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        elevation={6} 
        sx={{ 
          backgroundColor: '#121212',
          border: `2px solid ${palette.primary}`,
          borderRadius: '8px',
          boxShadow: `0 0 20px ${palette.primary}40`,
          overflow: 'hidden'
        }}
      >
        {/* Terminal Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: palette.primary + '30',
          p: 1,
          borderBottom: `1px solid ${palette.primary}`
        }}>
          <Typography sx={{ 
            fontFamily: 'monospace',
            color: palette.text,
            fontSize: '0.9rem',
            ml: 1
          }}>
            portfolio@ashfoster ~ /about
          </Typography>
          <Box>
            <IconButton size="small" sx={{ color: '#ff5f56' }}>
              <MinimizeIcon sx={{ fontSize: '0.8rem' }} />
            </IconButton>
            <IconButton size="small" sx={{ color: '#ffbd2e', mx: 0.5 }}>
              <CropSquareIcon sx={{ fontSize: '0.8rem' }} />
            </IconButton>
            <IconButton size="small" sx={{ color: '#27c93f' }}>
              <CloseIcon sx={{ fontSize: '0.8rem' }} />
            </IconButton>
          </Box>
        </Box>
        
        {/* Terminal Content */}
        <Box sx={{ 
          p: 3, 
          height: '400px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '1rem',
          lineHeight: 1.6,
          backgroundColor: '#121212',
          color: palette.text,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#1e1e1e',
          },
          '&::-webkit-scrollbar-thumb': {
            background: palette.primary + '60',
            borderRadius: '4px',
          },
        }}>
          {terminalLines.map((line, index) => (
            <Typography 
              key={index} 
              sx={{ 
                fontFamily: 'monospace',
                color: line.startsWith('>') ? palette.primary : palette.text,
                mb: 0.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {line}
            </Typography>
          ))}
          {currentLine < terminalContent.length && (
            <Typography 
              sx={{ 
                fontFamily: 'monospace',
                color: terminalContent[currentLine].startsWith('>') ? palette.primary : palette.text,
                mb: 0.5,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {terminalContent[currentLine].substring(0, charIndex)}
              <Box 
                component="span"
                sx={{ 
                  display: 'inline-block',
                  width: '0.6em',
                  height: '1.2em',
                  ml: 0.5,
                  backgroundColor: blinkCursor ? palette.accent : 'transparent',
                  transition: 'background-color 0.1s ease'
                }}
              />
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default About;