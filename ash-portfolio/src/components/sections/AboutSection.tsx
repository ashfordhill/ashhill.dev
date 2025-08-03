import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Container } from '@mui/material';
import { useAppSelector } from '../../store/hooks';
import { colorPalettes } from '../../store/slices/themeSlice';

const AboutSection: React.FC = () => {
  const currentPalette = useAppSelector((state) => state.theme.currentPalette);
  const palette = colorPalettes[currentPalette];
  const [typedText, setTypedText] = useState('');
  const [currentCommand, setCurrentCommand] = useState(0);

  const commands = [
    { command: '>whoami', output: 'Software Developer & Builder of Things' },
    { command: '> cat skills.txt', output: 'CI/CD • Rapid Prototyping • End-to-End Architecture\nJava/SpringBoot • React/TypeScript • Docker' },
    { command: '> echo $PHILOSOPHY', output: 'Good software connects the dots between what users need and what technology can deliver' }
  ];

  useEffect(() => {
    if (currentCommand < commands.length) {
      const fullText = `$ ${commands[currentCommand].command}\n${commands[currentCommand].output}\n\n`;
      let index = 0;
      
      const timer = setInterval(() => {
        if (index < fullText.length) {
          setTypedText(prev => prev + (fullText[index] || ''));
          index++;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            setCurrentCommand(prev => prev + 1);
          }, 1000);
        }
      }, 40);

      return () => clearInterval(timer);
    }
  }, [currentCommand]);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
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
        }}
      >
        <Typography 
          variant="h3" 
          sx={{ 
            color: palette.primary, 
            mb: { xs: 2, md: 3 }, 
            fontFamily: 'monospace',
            textShadow: `0 0 15px ${palette.primary}80`,
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontSize: { xs: '1.8rem', md: '3rem' }
          }}
        >
          About Me
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 }, flex: 1 }}>
          {/* Terminal Window */}
          <Box sx={{
            border: `2px solid ${palette.secondary}`,
            borderRadius: '8px',
            backgroundColor: '#000000E6',
            boxShadow: `0 0 20px ${palette.secondary}40`,
            overflow: 'hidden'
          }}>
            {/* Terminal Header */}
            <Box sx={{
              backgroundColor: palette.secondary + '20',
              borderBottom: `1px solid ${palette.secondary}`,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
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
            
            {/* Terminal Content */}
            <Box sx={{ p: { xs: 2, md: 3 }, minHeight: { xs: '180px', md: '225px' }, flex: 1 }}>
              <Typography 
                component="pre"
                sx={{ 
                  color: palette.primary,
                  fontFamily: 'monospace',
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  margin: 0
                }}
              >
                {typedText}
                {currentCommand < commands.length && (
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
                )}
              </Typography>
            </Box>
          </Box>

          {/* Additional Info */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 3 } }}>
            <Box sx={{ 
              flex: 1,
              p: { xs: 2, md: 3 }, 
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
                What I Do Best
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: palette.text, 
                  fontFamily: 'monospace',
                  lineHeight: 1.5,
                  fontSize: { xs: '0.9rem', md: '1rem' }
                }}
              >
                I connect the dots between ideas and implementation. Whether it's setting up CI/CD pipelines that just work, 
                rapidly prototyping to test concepts, or architecting systems that scale - I focus on building things that solve real problems.
              </Typography>
            </Box>

            <Box sx={{ 
              flex: 1,
              p: { xs: 2, md: 3 }, 
              border: `1px solid ${palette.primary}`,
              borderRadius: '8px',
              backgroundColor: palette.primary + '10'
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: palette.primary, 
                  mb: 2,
                  fontFamily: 'monospace',
                  textShadow: `0 0 5px ${palette.primary}60`
                }}
              >
                Current Stack
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: palette.text, 
                  fontFamily: 'monospace',
                  lineHeight: 1.5,
                  fontSize: { xs: '0.9rem', md: '1rem' }
                }}
              >
                No strong language preferences - I pick the right tool for the job. 
                Lately that's been Java/SpringBoot for backends, React/TypeScript for frontends, 
                and Docker for everything in between.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AboutSection;