import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Container, IconButton, Tooltip, Button, Chip } from '@mui/material';
import { LinkedIn, GitHub, Email, Terminal, PlayArrow, PhoneAndroid } from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';
import { colorPalettes } from '../../store/slices/themeSlice';
import useIsMobile from '../../hooks/useIsMobile';

interface TerminalCommand {
  command: string;
  description: string;
  output: string;
  color?: string;
}

const parseAnsiCodes = (text: string) => {
  // Clean up all ANSI escape codes first
  let cleanText = text
    .replace(/\x1b\[[0-9;]*m/g, (match, offset, string) => {
      // Extract the code part
      const codeMatch = match.match(/\x1b\[([0-9;]*)m/);
      if (!codeMatch) return '';
      
      const code = codeMatch[1];
      
      // Keep only the color codes we want to handle, remove everything else including [0m
      if (code === '1;32' || code === '1;33' || code === '1;34' || code === '1;35' || code === '1;36') {
        return match;
      }
      return ''; // Remove all other codes including [0m
    });

  // Replace remaining ANSI color codes with spans
  const parts = [];
  const regex = /\x1b\[([0-9;]+)m([^\x1b]*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(cleanText)) !== null) {
    // Add text before this match if there is any
    if (match.index > lastIndex) {
      const beforeText = cleanText.substring(lastIndex, match.index);
      if (beforeText.trim()) {
        parts.push(beforeText);
      }
    }

    const [, code, content] = match;
    let color = '';
    let fontWeight = 'normal';
    
    if (code === '1;32') { color = '#00FF00'; fontWeight = 'bold'; } // Green
    else if (code === '1;33') { color = '#FFFF00'; fontWeight = 'bold'; } // Yellow
    else if (code === '1;34') { color = '#0099FF'; fontWeight = 'bold'; } // Blue
    else if (code === '1;35') { color = '#8A2BE2'; fontWeight = 'bold'; } // Blue-Purple
    else if (code === '1;36') { color = '#00FFFF'; fontWeight = 'bold'; } // Cyan
    
    if (content.trim()) {
      parts.push(
        <span key={match.index} style={{ color, fontWeight }}>
          {content}
        </span>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text
  if (lastIndex < cleanText.length) {
    const remainingText = cleanText.substring(lastIndex);
    if (remainingText.trim()) {
      parts.push(remainingText);
    }
  }

  return parts.length > 0 ? parts : cleanText;
};

const AboutSection: React.FC = () => {
  const currentPalette = useAppSelector((state) => state.theme.currentPalette);
  const palette = colorPalettes[currentPalette];
  const [terminalOutput, setTerminalOutput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const commands: TerminalCommand[] = [
    { 
      command: 'whoami', 
      description: '',
      output: 'Ash Hill - Software Engineer',
      color: '#4CAF50'
    },
    { 
      command: 'ls -la exp/', 
      description: 'familiar tech',
      output: 'total 4\ndrwxr-xr-x  2 ash  users  4096 Aug  4 12:34 .\ndrwxr-xr-x 14 ash  users  4096 Aug  4 12:34 ..\n-rwxr-xr-x  1 ash  users   512 Aug  1 14:22 TypeScript & React\n-rwxr-xr-x  1 ash  users   128 Jul 30 18:45 Java & Spring Boot\n-rwxr-xr-x  1 ash  users   128 Jul 28 16:37 Docker\n-rwxr-xr-x  1 ash  users   64  Aug  2 10:15 CICD',
      color: '#2196F3'
    },
    { 
      command: 'cat hobbies.txt', 
      description: 'my hobbies',
      output: '📚 Reading - mostly nonfiction\n🌱 Gardening - growing things brings me peace\n🎵 Music - listening & creating\n🚶 Walking - to connect with nature\n🐾 Animals - 🐶🐦🕷️(❤️😺but allergic. when HypoCat vaccine!?)',
      color: '#FF9800'
    },
    { 
      command: 'printenv CORE_VALUES', 
      description: 'my values',
      output: '• Collaboration\n• Curiosity\n• Empathy\n• Humility\n• Imagination',
      color: '#9C27B0'
    },
    { 
      command: 'echo "$(flip table)"', 
      description: 'DO IT',
      output: '(╯°□°)╯︵ ┻━┻',
      color: '#E91E63'
    },
    { 
      command: 'clear terminal', 
      description: '',
      output: '',
      color: '#795548'
    }
  ];

  const typeText = async (text: string) => {
    setIsTyping(true);
    setCurrentInput('');
    
    for (let i = 0; i <= text.length; i++) {
      setCurrentInput(text.slice(0, i));
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    
    setIsTyping(false);
  };

  const executeCommand = async (cmd: TerminalCommand) => {
    // Auto-scroll to bottom when command is clicked
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
    
    await typeText(cmd.command);
    
    const prompt = '\x1b[1;32mash@portfolio\x1b[0m:\x1b[1;34m~\x1b[0m$ ';
    const commandText = `\x1b[1;33m${cmd.command}\x1b[0m`;
    
    if (cmd.command === 'clear') {
      setTerminalOutput('');
      setCurrentInput('');
      return;
    }
    
    const outputContent = `\x1b[1;35m${cmd.output}\x1b[0m`; // Purple/magenta color
    
    const newOutput = `${prompt}${commandText}\n${outputContent}\n\n`;
    setTerminalOutput(prev => prev + newOutput);
    setCurrentInput('');
    
    // Scroll to bottom after adding content
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 100);
  };

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage = '\x1b[1;36mWelcome to Ash\'s Portfolio Terminal!\x1b[0m\n\x1b[1;32mClick any command button to execute it.\x1b[0m\n\n';
    setTerminalOutput(welcomeMessage);
  }, []);

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: { xs: 1, md: 2 }, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: 0
      }}
    >
      <Paper 
        elevation={6} 
        sx={{ 
          p: { xs: 2, md: 3 }, 
          backgroundColor: palette.background + 'E6',
          border: `2px solid ${palette.border}`,
          borderRadius: '12px',
          boxShadow: `0 0 30px ${palette.border}40`,
          backdropFilter: 'blur(10px)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0
        }}
      >
        <Typography 
          variant="h3" 
          sx={{ 
            color: palette.primary, 
            mb: { xs: 1, md: 2 }, 
            fontFamily: 'monospace',
            textShadow: `0 0 15px ${palette.primary}80`,
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            flexShrink: 0
          }}
        >
          About Me
        </Typography>

        {/* Mobile Mode Indicator */}
        {isMobile && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 2,
            flexShrink: 0
          }}>
            <Chip
              icon={<PhoneAndroid />}
              label="Mobile View - Desktop version has more!"
              sx={{
                backgroundColor: palette.accent + '20',
                border: `1px solid ${palette.accent}60`,
                color: palette.accent,
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                '& .MuiChip-icon': {
                  color: palette.accent,
                }
              }}
            />
          </Box>
        )}

        {/* Contact Buttons */}
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'center',
          gap: { xs: 1, md: 2 },
          mb: { xs: 1, md: 2 },
          flexShrink: 0
        }}>
          <Tooltip title="LinkedIn">
            <IconButton
              aria-label="LinkedIn"
              sx={{
                backgroundColor: palette.secondary + '20',
                border: `2px solid ${palette.secondary}`,
                color: palette.primary,
                transition: 'all 0.3s',
                '&:hover': {
                  backgroundColor: palette.secondary + '40',
                  boxShadow: `0 0 10px ${palette.primary}80`,
                },
              }}
              href="https://www.linkedin.com/in/ashfordhill"
              target="_blank"
            >
              <LinkedIn />
            </IconButton>
          </Tooltip>
          <Tooltip title="GitHub">
            <IconButton
              aria-label="GitHub"
              sx={{
                backgroundColor: palette.secondary + '20',
                border: `2px solid ${palette.secondary}`,
                color: palette.primary,
                transition: 'all 0.3s',
                '&:hover': {
                  backgroundColor: palette.secondary + '40',
                  boxShadow: `0 0 10px ${palette.primary}80`,
                },
              }}
              href="https://github.com/ashfordhill"
              target="_blank"
            >
              <GitHub />
            </IconButton>
          </Tooltip>
          <Tooltip title="Email">
            <IconButton
              aria-label="Email"
              sx={{
                backgroundColor: palette.secondary + '20',
                border: `2px solid ${palette.secondary}`,
                color: palette.primary,
                transition: 'all 0.3s',
                '&:hover': {
                  backgroundColor: palette.secondary + '40',
                  boxShadow: `0 0 10px ${palette.primary}80`,
                },
              }}
              href="mailto:holler@ashhill.dev"
              target="_blank"
            >
              <Email />
            </IconButton>
          </Tooltip>

        </Box>

        {/* Main Content Area */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' },
          gap: { xs: 2, md: 3 }, 
          flex: 1,
          minHeight: 0,
          overflow: 'hidden'
        }}>
          {/* Command Buttons */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'row', lg: 'column' },
            flexWrap: { xs: 'wrap', lg: 'nowrap' },
            gap: 1,
            justifyContent: { xs: 'center', lg: 'flex-start' },
            alignItems: { xs: 'center', lg: 'stretch' },
            minWidth: { lg: '200px' },
            maxWidth: { lg: '200px' },
            flexShrink: 0
          }}>
            {commands.map((cmd, index) => (
              <Button
                key={index}
                variant="outlined"
                size="small"
                startIcon={cmd.command === 'clear' ? <Terminal /> : <PlayArrow />}
                onClick={() => executeCommand(cmd)}
                disabled={isTyping}
                sx={{
                  backgroundColor: palette.background + '40',
                  border: `1px solid ${cmd.color || palette.secondary}`,
                  color: cmd.color || palette.primary,
                  fontFamily: 'monospace',
                  fontSize: { xs: '0.7rem', md: '0.8rem' },
                  textTransform: 'none',
                  minWidth: { xs: 'auto', lg: '100%' },
                  justifyContent: 'flex-start',
                  '&:hover': {
                    backgroundColor: (cmd.color || palette.secondary) + '20',
                    borderColor: cmd.color || palette.secondary,
                    boxShadow: `0 0 8px ${cmd.color || palette.secondary}40`,
                  },
                  '&:disabled': {
                    opacity: 0.5
                  }
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  width: '100%'
                }}>
                  <Typography sx={{ 
                    fontSize: 'inherit', 
                    fontWeight: 'bold',
                    fontFamily: 'monospace'
                  }}>
                    {cmd.command}
                  </Typography>
                  <Typography sx={{ 
                    fontSize: '0.6rem', 
                    opacity: 0.8,
                    fontFamily: 'monospace',
                    display: { xs: 'none', lg: 'block' }
                  }}>
                    {cmd.description}
                  </Typography>
                </Box>
              </Button>
            ))}
          </Box>
          
          {/* Terminal Window */}
          <Box sx={{
            border: `2px solid ${palette.secondary}`,
            borderRadius: '8px',
            backgroundColor: '#000000E6',
            boxShadow: `0 0 20px ${palette.secondary}40`,
            overflow: 'hidden',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: 'auto',
            minHeight: 0
          }}>
            {/* Terminal Header */}
            <Box sx={{
              backgroundColor: palette.secondary + '20',
              borderBottom: `1px solid ${palette.secondary}`,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexShrink: 0
            }}>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#27ca3f' }} />
              </Box>
              <Typography sx={{ 
                color: palette.text, 
                fontFamily: 'monospace', 
                fontSize: '0.9rem',
                ml: 2
              }}>
                ash@portfolio:~
              </Typography>
            </Box>
            
            {/* Terminal Content with Scrollbar */}
            <Box 
              ref={terminalRef}
              sx={{ 
                p: { xs: 1.5, md: 2 }, 
                flex: 1,
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#1a1a1a',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: palette.secondary,
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: palette.primary,
                }
              }}
            >
              <Typography 
                component="pre"
                sx={{ 
                  color: palette.primary,
                  fontFamily: 'monospace',
                  fontSize: { xs: '0.75rem', md: '0.85rem' },
                  lineHeight: 1.4,
                  whiteSpace: 'pre-wrap',
                  margin: 0,
                  width: '100%',
                  overflowWrap: 'break-word'
                }}
              >
                {parseAnsiCodes(terminalOutput)}
                {isTyping && (
                  <>
                    <span style={{ color: '#00FF00', fontWeight: 'bold' }}>ash@portfolio</span>
                    <span style={{ color: '#0099FF', fontWeight: 'bold' }}>:~</span>
                    <span>$ </span>
                    <span style={{ color: '#FFFF00', fontWeight: 'bold' }}>{currentInput}</span>
                    <Box 
                      component="span" 
                      sx={{ 
                        animation: 'blink 1s infinite',
                        '@keyframes blink': {
                          '0%, 50%': { opacity: 1 },
                          '51%, 100%': { opacity: 0 }
                        }
                      }}
                    >
                      ▋
                    </Box>
                  </>
                )}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Disclaimer */}
        <Box sx={{
          p: { xs: 1.5, md: 2 },
          border: `1px solid ${palette.border}`,
          borderRadius: '8px',
          backgroundColor: palette.background + '40',
          textAlign: 'center',
          mt: { xs: 1, md: 2 },
          flexShrink: 0
        }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: palette.text + '80',
              fontFamily: 'monospace',
              fontSize: { xs: '0.7rem', md: '0.8rem' }
            }}
          >
            💡 This portfolio was generated using various AI chatbots and models
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default AboutSection;