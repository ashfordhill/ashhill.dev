import React from 'react';
import { Box, Typography, Paper, Container, Card, CardContent } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SpaIcon from '@mui/icons-material/Spa';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import { useAppSelector } from '../../store/hooks';
import { colorPalettes } from '../../store/slices/themeSlice';

const HealthSection: React.FC = () => {
  const currentPalette = useAppSelector((state) => state.theme.currentPalette);
  const palette = colorPalettes[currentPalette];

  const healthCards = [
    {
      icon: <FitnessCenterIcon sx={{ fontSize: '3rem', color: palette.primary }} />,
      title: 'Fitness Tracking',
      description: 'Monitor your workout progress and maintain consistency in your fitness journey.',
      features: ['Exercise logging', 'Progress tracking', 'Goal setting']
    },
    {
      icon: <SpaIcon sx={{ fontSize: '3rem', color: palette.secondary }} />,
      title: 'Wellness Monitoring',
      description: 'Track your mental health and wellness metrics for a balanced lifestyle.',
      features: ['Mood tracking', 'Sleep analysis', 'Stress management']
    },
    {
      icon: <LocalDiningIcon sx={{ fontSize: '3rem', color: palette.accent }} />,
      title: 'Nutrition Planning',
      description: 'Plan and track your nutrition intake for optimal health outcomes.',
      features: ['Meal planning', 'Calorie tracking', 'Nutrient analysis']
    }
  ];

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
          Health & Wellness
        </Typography>
        
        <Typography 
          variant="h6" 
          sx={{ 
            color: palette.text, 
            mb: 4, 
            textAlign: 'center',
            fontFamily: 'monospace',
            opacity: 0.9
          }}
        >
          Comprehensive health tracking and wellness management tools
        </Typography>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 3 
        }}>
          {healthCards.map((card, index) => (
            <Card 
              key={index}
              sx={{ 
                height: '100%',
                backgroundColor: palette.background + 'CC',
                border: `1px solid ${palette.border}`,
                borderRadius: '8px',
                boxShadow: `0 0 15px ${palette.border}30`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: `0 5px 25px ${palette.primary}40`,
                  borderColor: palette.primary,
                }
              }}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  {card.icon}
                </Box>
                
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: palette.secondary, 
                    mb: 2,
                    fontFamily: 'monospace',
                    textShadow: `0 0 5px ${palette.secondary}60`
                  }}
                >
                  {card.title}
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: palette.text, 
                    mb: 3,
                    fontFamily: 'monospace',
                    opacity: 0.9
                  }}
                >
                  {card.description}
                </Typography>

                <Box sx={{ textAlign: 'left' }}>
                  {card.features.map((feature, featureIndex) => (
                    <Typography 
                      key={featureIndex}
                      variant="body2" 
                      sx={{ 
                        color: palette.accent, 
                        mb: 1,
                        fontFamily: 'monospace',
                        '&:before': {
                          content: '"▶ "',
                          color: palette.primary,
                        }
                      }}
                    >
                      {feature}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ 
          mt: 4, 
          p: 3, 
          border: `1px solid ${palette.primary}`,
          borderRadius: '8px',
          backgroundColor: palette.primary + '10',
          textAlign: 'center'
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
            Coming Soon
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: palette.text, 
              fontFamily: 'monospace'
            }}
          >
            Advanced health analytics, AI-powered recommendations, and integrated wearable device support.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default HealthSection;