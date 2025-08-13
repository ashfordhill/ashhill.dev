import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Box, 
  IconButton, 
  Typography, 
  Slider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Alert,
  Link
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import InfoIcon from '@mui/icons-material/Info';
import { useAppSelector } from '../../store/hooks';
import { colorPalettes } from '../../store/slices/themeSlice';
import PixiAudioVisualizer from './PixiAudioVisualizer';



interface Track {
  id: number;
  title: string;
  artist: string;
  url: string;
}

const SimpleMusicPlayer: React.FC = () => {
  const currentPalette = useAppSelector((state) => state.theme.currentPalette);
  const currentSection = useAppSelector((state) => state.navigation.currentSection);
  const palette = colorPalettes[currentPalette];
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const wasPlayingRef = useRef(false); // Track playing state for auto-play
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if music section is active
  const isMusicActive = currentSection === 'music';

  // Memoize playlist to prevent unnecessary re-renders
  const playlist: Track[] = useMemo(() => [
    {
      id: 1,
      title: "Home Cookin",
      artist: "Jimit",
      url: "/music/Jimit - Home Cookin.mp3"
    },
    {
      id: 2,
      title: "Kissing the Moon",
      artist: "Skygaze",
      url: "/music/Skygaze - Kissing the Moon.mp3"
    }
  ], []);

  const currentTrack = useMemo(() => playlist[currentTrackIndex], [playlist, currentTrackIndex]);

  // Memoized event handlers to prevent unnecessary re-renders
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  }, []);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleLoadedData = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback((error: any) => {
    console.error('Audio loading error:', error);
    setIsLoading(false);
    setIsPlaying(false);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    wasPlayingRef.current = false;
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      wasPlayingRef.current = true; // Auto-play next track
    }
  }, [currentTrackIndex, playlist.length]);

  // Optimized play/pause with loading state and better error handling
  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        wasPlayingRef.current = false;
        setIsLoading(false);
      } else {
        setIsLoading(true);
        
        // Force reload the audio if it seems corrupted or not ready
        if (audio.readyState === 0 || audio.error) {
          console.log('Reloading audio due to readyState:', audio.readyState, 'or error:', audio.error);
          audio.load();
        }
        
        // Ensure audio is ready to play
        if (audio.readyState < 2) { // HAVE_CURRENT_DATA
          // Wait for audio to be ready
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Audio loading timeout'));
            }, 8000); // Increased timeout

            const onCanPlay = () => {
              clearTimeout(timeout);
              audio.removeEventListener('canplay', onCanPlay);
              audio.removeEventListener('loadeddata', onCanPlay);
              audio.removeEventListener('error', onError);
              resolve(undefined);
            };

            const onError = (e: any) => {
              clearTimeout(timeout);
              audio.removeEventListener('canplay', onCanPlay);
              audio.removeEventListener('loadeddata', onCanPlay);
              audio.removeEventListener('error', onError);
              reject(e);
            };

            audio.addEventListener('canplay', onCanPlay);
            audio.addEventListener('loadeddata', onCanPlay);
            audio.addEventListener('error', onError);
          });
        }

        // Additional check before playing
        if (audio.paused && audio.readyState >= 2) {
          await audio.play();
          setIsPlaying(true);
          wasPlayingRef.current = true;
          setIsLoading(false);
        } else {
          throw new Error('Audio not ready to play');
        }
      }
    } catch (error) {
      console.error('Play failed:', error);
      setIsPlaying(false);
      wasPlayingRef.current = false;
      setIsLoading(false);
      
      // Try to reload the audio element as a last resort
      if (audio) {
        audio.load();
      }
    }
  }, [isPlaying]);

  const playNextTrack = useCallback(() => {
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      // Don't change playing state - let the new track auto-play if currently playing
    }
  }, [currentTrackIndex, playlist.length]);

  const playPreviousTrack = useCallback(() => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
      // Don't change playing state - let the new track auto-play if currently playing
    }
  }, [currentTrackIndex]);

  const selectTrack = useCallback((index: number) => {
    setCurrentTrackIndex(index);
    setShowPlaylist(false);
    // Don't change playing state - let the new track auto-play if currently playing
  }, []);

  const handleSeek = useCallback((event: Event, newValue: number | number[]) => {
    if (!audioRef.current) return;
    const time = Array.isArray(newValue) ? newValue[0] : newValue;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const handleVolumeChange = useCallback((event: Event, newValue: number | number[]) => {
    const vol = Array.isArray(newValue) ? newValue[0] : newValue;
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    audioRef.current.muted = newMuted;
    setIsMuted(newMuted);
  }, [isMuted]);

  const formatTime = useCallback((time: number) => {
    if (!isFinite(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Optimized audio setup with lazy loading
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const wasPlaying = wasPlayingRef.current; // Remember if we were playing before track change

    // Reset state
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false); // Temporarily stop while loading
    setIsLoading(false); // Don't set loading true here, let onLoadStart handle it

    // Set up new track with lazy loading
    audio.src = currentTrack.url;
    audio.preload = 'metadata'; // Only load metadata initially
    audio.load();

    // Auto-play if we were playing before the track change
    if (wasPlaying) {
      const playWhenReady = () => {
        if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
          audio.play().then(() => {
            setIsPlaying(true);
            wasPlayingRef.current = true;
          }).catch((error) => {
            console.error('Auto-play failed:', error);
            setIsPlaying(false);
            wasPlayingRef.current = false;
          });
        } else {
          // Wait for the audio to be ready
          const onCanPlay = () => {
            audio.removeEventListener('canplay', onCanPlay);
            audio.play().then(() => {
              setIsPlaying(true);
              wasPlayingRef.current = true;
            }).catch((error) => {
              console.error('Auto-play failed:', error);
              setIsPlaying(false);
              wasPlayingRef.current = false;
            });
          };
          audio.addEventListener('canplay', onCanPlay);
        }
      };

      // Small delay to ensure the audio element is ready
      setTimeout(playWhenReady, 100);
    }
  }, [currentTrack.url]);

  // Separate effect for volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Initialize audio element on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      // Set initial properties
      audio.volume = volume;
      audio.muted = isMuted;
      audio.preload = 'metadata';
    }
  }, []); // Only run once on mount

  // Handle section changes and tab visibility
  useEffect(() => {
    if (!isMusicActive && isPlaying) {
      wasPlayingRef.current = true; // Remember we were playing
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isMusicActive, isPlaying]);

  // Handle page visibility changes (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (document.hidden) {
        // Page is hidden (tab switched away)
        if (isPlaying) {
          wasPlayingRef.current = true;
          audio.pause();
          setIsPlaying(false);
        }
      } else {
        // Page is visible again (tab switched back)
        if (wasPlayingRef.current && isMusicActive) {
          // Small delay to ensure everything is ready
          setTimeout(() => {
            if (audio.readyState >= 2) {
              audio.play().then(() => {
                setIsPlaying(true);
              }).catch((error) => {
                console.error('Resume play failed:', error);
                // Force reload and try again
                audio.load();
                setTimeout(() => {
                  audio.play().then(() => {
                    setIsPlaying(true);
                  }).catch((e) => {
                    console.error('Second attempt failed:', e);
                  });
                }, 500);
              });
            } else {
              // Audio not ready, reload it
              audio.load();
            }
          }, 200);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, isMusicActive]);

  if (!palette) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Theme palette not loaded</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      background: `linear-gradient(135deg, ${palette.background}F0 0%, ${palette.primary}05 25%, ${palette.secondary}05 50%, ${palette.accent}05 75%, ${palette.background}F0 100%)`,
      overflow: 'hidden',
    }}>
      {/* Left Side - Controls */}
      <Box sx={{
        flex: '0 0 400px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        pr: 3,
      }}>
        <Card sx={{
          background: `linear-gradient(135deg, ${palette.background}E0 0%, ${palette.primary}08 50%, ${palette.secondary}08 100%)`,
          border: `2px solid ${palette.border}40`,
          borderRadius: '16px',
          boxShadow: `0 8px 32px ${palette.border}30`,
          backdropFilter: 'blur(10px)',
        }}>
          <CardContent sx={{ p: 3 }}>
            {/* Track Info */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: palette.primary,
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  mb: 1,
                }}
              >
                {currentTrack.title}
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: palette.secondary,
                  fontFamily: 'monospace',
                  opacity: 0.8,
                  mb: 1
                }}
              >
                {currentTrack.artist}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: palette.text,
                  fontFamily: 'monospace',
                  opacity: 0.6
                }}
              >
                Track {currentTrackIndex + 1} of {playlist.length}
              </Typography>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ mb: 3 }}>
              <Slider
                value={currentTime}
                max={duration || 100}
                onChange={handleSeek}
                disabled={!duration}
                sx={{
                  color: palette.primary,
                  '& .MuiSlider-thumb': { backgroundColor: palette.primary },
                  '& .MuiSlider-track': { backgroundColor: palette.primary },
                  '& .MuiSlider-rail': { backgroundColor: palette.border },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography sx={{ color: palette.text, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {formatTime(currentTime)}
                </Typography>
                <Typography sx={{ color: palette.text, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {formatTime(duration)}
                </Typography>
              </Box>
            </Box>

            {/* Controls */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 1,
              mb: 3
            }}>
              <IconButton
                onClick={playPreviousTrack}
                disabled={currentTrackIndex === 0}
                sx={{ color: palette.secondary, '&:hover': { color: palette.accent } }}
              >
                <SkipPreviousIcon sx={{ fontSize: 28 }} />
              </IconButton>

              <IconButton
                onClick={togglePlay}
                disabled={isLoading}
                sx={{
                  color: palette.primary,
                  backgroundColor: `${palette.primary}15`,
                  border: `2px solid ${palette.primary}40`,
                  borderRadius: '50%',
                  width: 56,
                  height: 56,
                  opacity: isLoading ? 0.7 : 1,
                  '&:hover': {
                    color: palette.accent,
                    backgroundColor: `${palette.accent}15`,
                    transform: isLoading ? 'none' : 'scale(1.1)',
                  },
                  '&:disabled': {
                    color: palette.primary,
                    backgroundColor: `${palette.primary}15`,
                  }
                }}
              >
                {isLoading ? (
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      border: `3px solid ${palette.primary}30`,
                      borderTop: `3px solid ${palette.primary}`,
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' }
                      }
                    }}
                  />
                ) : isPlaying ? (
                  <PauseIcon sx={{ fontSize: 32 }} />
                ) : (
                  <PlayArrowIcon sx={{ fontSize: 32 }} />
                )}
              </IconButton>

              <IconButton
                onClick={playNextTrack}
                disabled={currentTrackIndex === playlist.length - 1}
                sx={{ color: palette.secondary, '&:hover': { color: palette.accent } }}
              >
                <SkipNextIcon sx={{ fontSize: 28 }} />
              </IconButton>
            </Box>

            {/* Volume & Playlist */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <IconButton
                  onClick={toggleMute}
                  sx={{ color: palette.secondary, '&:hover': { color: palette.accent } }}
                >
                  {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </IconButton>
                <Slider
                  value={isMuted ? 0 : volume}
                  max={1}
                  step={0.01}
                  onChange={handleVolumeChange}
                  sx={{
                    color: palette.secondary,
                    flex: 1,
                    '& .MuiSlider-thumb': { backgroundColor: palette.secondary },
                    '& .MuiSlider-track': { backgroundColor: palette.secondary },
                    '& .MuiSlider-rail': { backgroundColor: palette.border }
                  }}
                />
              </Box>

              <IconButton
                onClick={() => setShowPlaylist(!showPlaylist)}
                sx={{
                  color: showPlaylist ? palette.accent : palette.secondary,
                  '&:hover': { color: palette.accent }
                }}
              >
                <QueueMusicIcon />
              </IconButton>
            </Box>

            {/* Playlist */}
            {showPlaylist && (
              <Box sx={{ mt: 2, maxHeight: 200, overflow: 'auto' }}>
                <Typography variant="subtitle2" sx={{ color: palette.primary, mb: 1, textAlign: 'center' }}>
                  Playlist
                </Typography>
                <List sx={{ p: 0 }}>
                  {playlist.map((track, index) => (
                    <ListItem key={track.id} sx={{ p: 0, mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => selectTrack(index)}
                        selected={index === currentTrackIndex}
                        sx={{
                          borderRadius: '8px',
                          py: 0.5,
                          backgroundColor: index === currentTrackIndex ? `${palette.primary}15` : 'transparent',
                          '&:hover': { backgroundColor: `${palette.accent}10` }
                        }}
                      >
                        <ListItemText
                          primary={track.title}
                          secondary={track.artist}
                          primaryTypographyProps={{
                            sx: { fontSize: '0.9rem', fontFamily: 'monospace', color: palette.text }
                          }}
                          secondaryTypographyProps={{
                            sx: { fontSize: '0.8rem', fontFamily: 'monospace', opacity: 0.7 }
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <Alert 
          icon={<InfoIcon />}
          severity="info" 
          sx={{ 
            mt: 2,
            fontSize: '0.8rem',
            backgroundColor: `${palette.primary}10`,
            border: `1px solid ${palette.primary}30`,
            '& .MuiAlert-icon': { color: palette.primary }
          }}
        >
          🎵 Royalty-free music from{' '}
          <Link 
            href="https://artlist.io/" 
            target="_blank" 
            sx={{ color: palette.accent, textDecoration: 'none' }}
          >
            Artlist.io
          </Link>
        </Alert>
      </Box>

      {/* Right Side - Visualizer */}
      <Box sx={{
        flex: 1,
        height: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <PixiAudioVisualizer 
          audioRef={audioRef} 
          isPlaying={isPlaying} 
          palette={palette} 
        />
      </Box>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onLoadedData={handleLoadedData}
        onError={handleError}
        onEnded={handleEnded}
        preload="metadata"
      />
    </Box>
  );
};

export default React.memo(SimpleMusicPlayer);