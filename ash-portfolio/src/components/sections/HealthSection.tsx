import React from 'react';
import { Box, Typography, Paper, Container, Card, CardContent, Chip, IconButton, Tooltip, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import RefreshIcon from '@mui/icons-material/Refresh';
import LaunchIcon from '@mui/icons-material/Launch';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useAppSelector } from '../../store/hooks';
import { colorPalettes } from '../../store/slices/themeSlice';
import { useGitHubStatus } from '../../hooks/useGitHubStatus';
import { RepositoryStatus } from '../../types/github';

const HealthSection: React.FC = () => {
  const currentPalette = useAppSelector((state) => state.theme.currentPalette);
  const palette = colorPalettes[currentPalette];

  const repositories = [
    { owner: 'ashfordhill', repo: 'dynamic-integration-tester', branch: 'main' },
    { owner: 'ashfordhill', repo: 'puppeteer-action', branch: 'main' },
    { owner: 'ashfordhill', repo: 'ashhill.dev', branch: 'main' }
  ];

  const { statuses, isLoading, lastUpdated, refreshStatuses } = useGitHubStatus({
    repositories,
    refreshInterval: 900000 // 15 minutes
  });

  const getStatusIcon = (status: RepositoryStatus) => {
    if (status.error) {
      return <ErrorIcon sx={{ fontSize: '3rem', color: palette.accent }} />;
    }

    if (!status.latestRun) {
      return <PendingIcon sx={{ fontSize: '3rem', color: palette.text }} />;
    }

    switch (status.latestRun.conclusion) {
      case 'success':
        return <CheckCircleIcon sx={{ fontSize: '3rem', color: '#4CAF50' }} />;
      case 'failure':
        return <ErrorIcon sx={{ fontSize: '3rem', color: '#F44336' }} />;
      case 'cancelled':
        return <PendingIcon sx={{ fontSize: '3rem', color: '#FF9800' }} />;
      default:
        return <PendingIcon sx={{ fontSize: '3rem', color: palette.text }} />;
    }
  };

  const getStatusColor = (status: RepositoryStatus) => {
    if (status.error) return palette.accent;
    if (!status.latestRun) return palette.text;
    
    switch (status.latestRun.conclusion) {
      case 'success': return '#4CAF50';
      case 'failure': return '#F44336';
      case 'cancelled': return '#FF9800';
      default: return palette.text;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Paper 
        elevation={6} 
        sx={{ 
          p: 3,
          backgroundColor: palette.background + 'E6',
          border: `2px solid ${palette.border}`,
          borderRadius: '12px',
          boxShadow: `0 0 30px ${palette.border}40`,
          backdropFilter: 'blur(10px)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: palette.primary, 
              fontFamily: 'monospace',
              textShadow: `0 0 15px ${palette.primary}80`,
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontSize: { xs: '1.8rem', md: '2.2rem' }
            }}
          >
            CI/CD Dashboard
          </Typography>
        </Box>



        {lastUpdated && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: palette.text, 
              mb: 2, 
              textAlign: 'center',
              fontFamily: 'monospace',
              opacity: 0.7,
              fontSize: '0.75rem'
            }}
          >
            Last updated: {formatDate(lastUpdated.toISOString())}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: -2 }}>
          <Tooltip title="Refresh Status">
            <IconButton 
              onClick={refreshStatuses}
              sx={{ 
                color: palette.secondary,
                '&:hover': {
                  color: palette.primary,
                  transform: 'rotate(180deg)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          pr: 1, // Account for scrollbar
          pt: 1, // Padding top to allow room for hover transform
          pb: 1, // Padding bottom for symmetry
          alignContent: 'center', // Center cards vertically in the grid
          justifyContent: 'center' // Center cards horizontally in the grid
        }}>
          {statuses.map((status, index) => (
            <Card 
              key={status.repo.full_name}
              sx={{ 
                height: '400px', // Fixed height for all cards
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: palette.background + 'CC',
                border: `1px solid ${palette.border}`,
                borderRadius: '8px',
                boxShadow: `0 0 15px ${palette.border}30`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: `0 3px 20px ${getStatusColor(status)}40`,
                  borderColor: getStatusColor(status),
                }
              }}
            >
              <CardContent sx={{ 
                p: 2, 
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Box sx={{ mb: 1.5 }}>
                  {getStatusIcon(status)}
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: palette.secondary, 
                      fontFamily: 'monospace',
                      textShadow: `0 0 5px ${palette.secondary}60`,
                      mr: 1,
                      fontSize: { xs: '1rem', md: '1.25rem' }
                    }}
                  >
                    {status.repo.name}
                  </Typography>
                  {status.isLoading && (
                    <CircularProgress 
                      size={16} 
                      sx={{ 
                        color: palette.secondary, 
                        opacity: 0.6,
                        mr: 1
                      }} 
                    />
                  )}
                  <Tooltip title="View on GitHub">
                    <IconButton
                      size="small"
                      onClick={() => window.open(status.repo.html_url, '_blank')}
                      sx={{ color: palette.text, opacity: 0.7 }}
                    >
                      <LaunchIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: palette.text, 
                    mb: 2,
                    fontFamily: 'monospace',
                    opacity: status.isLoading ? 0.6 : 0.8,
                    fontStyle: status.isLoading ? 'italic' : 'normal',
                    fontSize: '0.8rem',
                    lineHeight: 1.3,
                    height: '3.9rem', // Fixed height for 3 lines
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {status.isLoading 
                    ? 'Loading repository information...' 
                    : (status.repo.description || 'No description available')
                  }
                </Typography>

                {/* Spacer to push content to bottom */}
                <Box sx={{ flex: 1 }} />

                {status.error ? (
                  <Box>
                    <Chip 
                      label={status.error.includes('rate limit') ? "Rate Limited" : "API Error"} 
                      color="error" 
                      size="small"
                      sx={{ mb: 1.5, fontFamily: 'monospace', fontSize: '0.7rem' }}
                    />
                  </Box>
                ) : status.isLoading ? (
                  <Box>
                    <Chip 
                      label="Loading..." 
                      sx={{ 
                        backgroundColor: palette.secondary + '20',
                        color: palette.secondary,
                        fontFamily: 'monospace',
                        mb: 1.5,
                        fontSize: '0.7rem'
                      }}
                    />
                  </Box>
                ) : status.latestRun ? (
                  <Box sx={{ mb: 1.5 }}>
                    <Chip 
                      label={status.latestRun.conclusion || 'Unknown'}
                      sx={{ 
                        backgroundColor: getStatusColor(status) + '20',
                        color: getStatusColor(status),
                        fontFamily: 'monospace',
                        mb: 0.5,
                        fontSize: '0.7rem'
                      }}
                    />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: palette.text, 
                        fontFamily: 'monospace',
                        opacity: 0.7,
                        fontSize: '0.75rem'
                      }}
                    >
                      Run #{status.latestRun.run_number}
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Chip 
                      label="No Runs" 
                      sx={{ 
                        backgroundColor: palette.text + '20',
                        color: palette.text,
                        fontFamily: 'monospace',
                        mb: 1.5,
                        fontSize: '0.7rem'
                      }}
                    />
                  </Box>
                )}

                <Box sx={{ textAlign: 'left' }}>
                  {status.latestRun && (
                    <>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: palette.accent, 
                          mb: 0.5,
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          '&:before': {
                            content: '"▶ "',
                            color: palette.primary,
                          }
                        }}
                      >
                        {status.latestRun.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: palette.accent, 
                          mb: 0.5,
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          '&:before': {
                            content: '"▶ "',
                            color: palette.primary,
                          }
                        }}
                      >
                        {getTimeSince(status.latestRun.updated_at)}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: palette.accent, 
                          mb: 0.5,
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          '&:before': {
                            content: '"▶ "',
                            color: palette.primary,
                          }
                        }}
                      >
                        Branch: {status.latestRun.head_branch}
                      </Typography>
                    </>
                  )}
                  {status.error && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: palette.accent, 
                        mb: 0.5,
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        '&:before': {
                          content: '"▶ "',
                          color: palette.primary,
                        }
                      }}
                    >
                      {status.error}
                    </Typography>
                  )}
                </Box>

                {status.latestRun && (
                  <Box sx={{ mt: 1.0 }}>
                    <Tooltip title="View Workflow Run">
                      <IconButton
                        size="small"
                        onClick={() => window.open(status.latestRun!.html_url, '_blank')}
                        sx={{ 
                          color: palette.secondary,
                          '&:hover': { color: palette.primary }
                        }}
                      >
                        <GitHubIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      </Paper>
    </Container>
  );
};

export default HealthSection;