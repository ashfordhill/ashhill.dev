import React, { useState, useRef, useEffect, useCallback } from 'react';
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

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  palette: any;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioRef, isPlaying, palette }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const isSetupRef = useRef<boolean>(false);

  const setupAudioContext = useCallback(() => {
    if (!audioRef.current || isSetupRef.current) return;

    try {
      // Create AudioContext only once
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Create analyser only once
      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
      }
      
      // Create source only once
      if (!sourceRef.current && audioRef.current) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        isSetupRef.current = true;
      }
    } catch (error) {
      console.warn('AudioContext setup failed:', error);
      // Continue without audio analysis
    }
  }, [audioRef]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dataArray: Uint8Array;
    let bufferLength: number;

    if (analyserRef.current && audioRef.current && !audioRef.current.paused && !audioRef.current.ended) {
      // Real audio data
      try {
        bufferLength = analyserRef.current.frequencyBinCount;
        dataArray = new Uint8Array(new ArrayBuffer(bufferLength));
        analyserRef.current.getByteFrequencyData(dataArray);
      } catch (error) {
        // Fallback to demo mode if audio analysis fails
        bufferLength = 128;
        dataArray = new Uint8Array(new ArrayBuffer(bufferLength));
        const time = Date.now() * 0.001;
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.floor(
            (Math.sin(time * 2 + i * 0.1) * 0.5 + 0.5) * 
            (Math.sin(time * 0.5 + i * 0.05) * 0.5 + 0.5) * 
            255 * (isPlaying ? 1 : 0.3)
          );
        }
      }
    } else {
      // Demo mode - simulate audio data
      bufferLength = 128;
      dataArray = new Uint8Array(new ArrayBuffer(bufferLength));
      const time = Date.now() * 0.001;
      for (let i = 0; i < bufferLength; i++) {
        dataArray[i] = Math.floor(
          (Math.sin(time * 2 + i * 0.1) * 0.5 + 0.5) * 
          (Math.sin(time * 0.5 + i * 0.05) * 0.5 + 0.5) * 
          255 * (isPlaying ? 1 : 0.3)
        );
      }
    }

      // Clear canvas with fade effect
      const fadeColor = palette.background.startsWith('hsl') 
        ? palette.background.replace('hsl(', 'hsla(').replace(')', ', 0.08)')
        : palette.background.startsWith('#') 
          ? `${palette.background}15`
          : `rgba(${palette.background.replace(/[^\d,]/g, '')}, 0.08)`;
      
      ctx.fillStyle = fadeColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create equalizer-style visualization with rainbow gradients
      const barWidth = canvas.width / bufferLength;
      const maxBarHeight = canvas.height * 0.8;
      
      // Create rainbow color function
      const getRainbowColor = (index: number, total: number, amplitude: number) => {
        const hue = (index / total) * 360;
        const saturation = 70 + amplitude * 30; // More saturated with higher amplitude
        const lightness = 50 + amplitude * 30; // Brighter with higher amplitude
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      };

      // Draw equalizer bars
      for (let i = 0; i < bufferLength; i++) {
        const amplitude = dataArray[i] / 255;
        const barHeight = amplitude * maxBarHeight;
        const x = i * barWidth;
        const y = canvas.height - barHeight;

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(x, canvas.height, x, y);
        const rainbowColor = getRainbowColor(i, bufferLength, amplitude);
        
        // Add theme color influence
        const themeInfluence = 0.3;
        const baseColor = i < bufferLength / 3 ? palette.primary : 
                         i < bufferLength * 2 / 3 ? palette.secondary : palette.accent;
        
        // Convert theme color to rgba format for proper alpha blending
        const alphaValue = Math.floor(amplitude * 100 + 50) / 255;
        const themeColorWithAlpha = baseColor.startsWith('hsl') 
          ? baseColor.replace('hsl(', 'hsla(').replace(')', `, ${alphaValue})`)
          : baseColor.startsWith('#') 
            ? `${baseColor}${Math.floor(alphaValue * 255).toString(16).padStart(2, '0')}`
            : `rgba(${baseColor.replace(/[^\d,]/g, '')}, ${alphaValue})`;
        
        gradient.addColorStop(0, rainbowColor);
        gradient.addColorStop(0.5, themeColorWithAlpha);
        gradient.addColorStop(1, rainbowColor);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 1, barHeight);

        // Add glow effect for higher amplitudes
        if (amplitude > 0.4) {
          ctx.shadowColor = rainbowColor;
          ctx.shadowBlur = 10 + amplitude * 20;
          ctx.fillRect(x, y, barWidth - 1, barHeight);
          ctx.shadowBlur = 0;
        }

        // Add reflection effect
        const reflectionHeight = barHeight * 0.3;
        const reflectionGradient = ctx.createLinearGradient(x, canvas.height, x, canvas.height + reflectionHeight);
        
        // Convert rainbow color to rgba format for proper alpha blending
        const rainbowColorWithAlpha = rainbowColor.startsWith('hsl') 
          ? rainbowColor.replace('hsl(', 'hsla(').replace(')', ', 0.25)')
          : rainbowColor.startsWith('#') 
            ? `${rainbowColor}40`
            : `rgba(${rainbowColor.replace(/[^\d,]/g, '')}, 0.25)`;
            
        const rainbowColorTransparent = rainbowColor.startsWith('hsl') 
          ? rainbowColor.replace('hsl(', 'hsla(').replace(')', ', 0)')
          : rainbowColor.startsWith('#') 
            ? `${rainbowColor}00`
            : `rgba(${rainbowColor.replace(/[^\d,]/g, '')}, 0)`;
        
        reflectionGradient.addColorStop(0, rainbowColorWithAlpha);
        reflectionGradient.addColorStop(1, rainbowColorTransparent);
        
        ctx.fillStyle = reflectionGradient;
        ctx.fillRect(x, canvas.height, barWidth - 1, reflectionHeight);
      }

      // Add frequency-based particles
      for (let i = 0; i < bufferLength; i += 8) {
        const amplitude = dataArray[i] / 255;
        if (amplitude > 0.6) {
          const x = (i / bufferLength) * canvas.width;
          const y = canvas.height - amplitude * maxBarHeight;
          const particleSize = 2 + amplitude * 4;
          
          const rainbowColor = getRainbowColor(i, bufferLength, amplitude);
          
          // Convert rainbow color to rgba format for proper alpha blending
          const particleAlpha = amplitude * 0.8; // Use decimal alpha for particles
          const particleColor = rainbowColor.startsWith('hsl') 
            ? rainbowColor.replace('hsl(', 'hsla(').replace(')', `, ${particleAlpha})`)
            : rainbowColor.startsWith('#') 
              ? `${rainbowColor}${Math.floor(particleAlpha * 255).toString(16).padStart(2, '0')}`
              : `rgba(${rainbowColor.replace(/[^\d,]/g, '')}, ${particleAlpha})`;
          
          ctx.fillStyle = particleColor;
          
          // Floating particles
          const time = Date.now() * 0.002;
          const offsetX = Math.sin(time + i * 0.1) * 20;
          const offsetY = Math.cos(time + i * 0.1) * 10;
          
          ctx.beginPath();
          ctx.arc(x + offsetX, y + offsetY - 20, particleSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

    // Continue animation
    animationRef.current = requestAnimationFrame(draw);
  }, [audioRef, isPlaying, palette]);

  useEffect(() => {
    // Start animation loop
    const startAnimation = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      draw();
    };

    startAnimation();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw]);

  // Setup audio context when playing starts
  useEffect(() => {
    if (isPlaying && audioRef.current && audioRef.current.src) {
      setupAudioContext();
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume().catch(console.warn);
      }
    }
  }, [isPlaying, setupAudioContext]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
      style={{
        width: '100%',
        height: '300px',
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${palette.background.startsWith('#') ? palette.background + '40' : palette.background.replace('hsl(', 'hsla(').replace(')', ', 0.25)')} 0%, ${palette.primary.startsWith('#') ? palette.primary + '08' : palette.primary.replace('hsl(', 'hsla(').replace(')', ', 0.03)')} 50%, ${palette.secondary.startsWith('#') ? palette.secondary + '08' : palette.secondary.replace('hsl(', 'hsla(').replace(')', ', 0.03)')} 100%)`,
        border: `2px solid ${palette.border.startsWith('#') ? palette.border + '30' : palette.border.replace('hsl(', 'hsla(').replace(')', ', 0.19)')}`,
        boxShadow: `0 0 20px ${palette.primary.startsWith('#') ? palette.primary + '20' : palette.primary.replace('hsl(', 'hsla(').replace(')', ', 0.13)')}, inset 0 0 20px ${palette.secondary.startsWith('#') ? palette.secondary + '10' : palette.secondary.replace('hsl(', 'hsla(').replace(')', ', 0.06)')}`
      }}
    />
  );
};

interface Track {
  id: number;
  title: string;
  artist: string;
  url: string;
}

const MusicSection: React.FC = () => {
  const currentPalette = useAppSelector((state) => state.theme.currentPalette);
  const palette = colorPalettes[currentPalette];
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Playlist with your MP3 files
  const playlist: Track[] = [
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
  ];

  const currentTrack = playlist[currentTrackIndex];

  // Audio event handlers
  const updateTime = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const updateDuration = useCallback(() => {
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    // Auto-play next track
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  }, [currentTrackIndex, playlist.length]);

  const handleError = useCallback((e: Event) => {
    console.error('Audio error:', e);
    setError('Failed to load audio file');
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [updateTime, updateDuration, handleEnded, handleError]);

  // Initialize audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set initial volume
    audio.volume = volume;
    audio.muted = isMuted;
  }, []);

  // Load current track when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.src = currentTrack.url;
      audio.volume = volume;
      audio.muted = isMuted;
      audio.load();
      setCurrentTime(0);
      setDuration(0);
      setError(null);
    } catch (err) {
      console.error('Failed to load track:', err);
      setError('Failed to load track');
    }
  }, [currentTrack, volume, isMuted]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Ensure audio is loaded
        if (!audioRef.current.src) {
          audioRef.current.src = currentTrack.url;
          audioRef.current.load();
        }
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setError(null);
            })
            .catch((err) => {
              console.error('Play failed:', err);
              setError(`Failed to play audio: ${err.message}`);
              setIsPlaying(false);
            });
        } else {
          setIsPlaying(true);
        }
      }
    } catch (err) {
      console.error('Toggle play failed:', err);
      setError('Audio control failed');
      setIsPlaying(false);
    }
  }, [isPlaying, currentTrack.url]);

  const playNextTrack = useCallback(() => {
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      // Don't auto-play, let user click play
      setIsPlaying(false);
    }
  }, [currentTrackIndex, playlist.length]);

  const playPreviousTrack = useCallback(() => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
      // Don't auto-play, let user click play
      setIsPlaying(false);
    }
  }, [currentTrackIndex]);

  const selectTrack = useCallback((index: number) => {
    setCurrentTrackIndex(index);
    // Don't auto-play, let user click play
    setIsPlaying(false);
    setShowPlaylist(false);
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
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const formatTime = useCallback((time: number) => {
    if (!isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  if (!palette) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Theme palette not loaded</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      p: { xs: 2, sm: 3 },
      pt: { xs: 1, sm: 2 },
      background: `linear-gradient(135deg, ${palette.background}F0 0%, ${palette.primary}05 25%, ${palette.secondary}05 50%, ${palette.accent}05 75%, ${palette.background}F0 100%)`,
      overflow: 'auto',
    }}>
      <Card sx={{
        maxWidth: 600,
        width: '100%',
        maxHeight: 'calc(100vh - 120px)',
        overflow: 'auto',
        background: `linear-gradient(135deg, ${palette.background}E0 0%, ${palette.primary}08 50%, ${palette.secondary}08 100%)`,
        border: `2px solid ${palette.border}40`,
        borderRadius: '16px',
        boxShadow: `0 8px 32px ${palette.border}30, inset 0 1px 0 ${palette.primary}20`,
        backdropFilter: 'blur(10px)',
      }}>
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Royalty-Free Music Info */}
          <Alert 
            icon={<InfoIcon />}
            severity="info" 
            sx={{ 
              mb: 3,
              backgroundColor: `${palette.primary}10`,
              border: `1px solid ${palette.primary}30`,
              color: palette.text,
              '& .MuiAlert-icon': {
                color: palette.primary
              }
            }}
          >
            <Typography sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
              🎵 Royalty-free AI-generated music from{' '}
              <Link 
                href="https://artlist.io/" 
                target="_blank" 
                sx={{ 
                  color: palette.accent,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Artlist.io
              </Link>
            </Typography>
          </Alert>

          {/* Track Info */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                color: palette.primary,
                fontFamily: 'monospace',
                fontWeight: 'bold',
                textShadow: `0 0 10px ${palette.primary}60`,
                mb: 1
              }}
            >
              {currentTrack.title}
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: palette.text,
                fontFamily: 'monospace',
                opacity: 0.8
              }}
            >
              {currentTrack.artist}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: palette.text,
                fontFamily: 'monospace',
                opacity: 0.6,
                mt: 1
              }}
            >
              Track {currentTrackIndex + 1} of {playlist.length}
            </Typography>
          </Box>

          {/* Audio Visualizer */}
          <Box sx={{ mb: 3 }}>
            <AudioVisualizer 
              audioRef={audioRef} 
              isPlaying={isPlaying} 
              palette={palette} 
            />
          </Box>

          {/* Progress Bar */}
          <Box sx={{ mb: 2 }}>
            <Slider
              value={currentTime}
              max={duration > 0 ? duration : 100}
              onChange={handleSeek}
              disabled={!duration || duration === 0}
              sx={{
                color: palette.primary,
                '& .MuiSlider-thumb': {
                  backgroundColor: palette.primary,
                  boxShadow: `0 0 10px ${palette.primary}60`,
                  '&:hover': {
                    boxShadow: `0 0 15px ${palette.primary}80`,
                  }
                },
                '& .MuiSlider-track': {
                  backgroundColor: palette.primary,
                  boxShadow: `0 0 5px ${palette.primary}40`,
                },
                '& .MuiSlider-rail': {
                  backgroundColor: palette.border,
                },
                '&.Mui-disabled': {
                  color: palette.border,
                  '& .MuiSlider-thumb': {
                    backgroundColor: palette.border,
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: palette.border,
                  }
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography sx={{ color: palette.text, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {formatTime(currentTime)}
              </Typography>
              <Typography sx={{ color: palette.text, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {formatTime(duration)}
              </Typography>
            </Box>
          </Box>

          {/* Controls */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 2,
            mb: 2
          }}>
            {/* Previous Track */}
            <IconButton
              onClick={playPreviousTrack}
              disabled={currentTrackIndex === 0}
              sx={{
                color: currentTrackIndex === 0 ? palette.border : palette.secondary,
                '&:hover': {
                  color: palette.accent,
                  transform: currentTrackIndex === 0 ? 'none' : 'scale(1.1)',
                }
              }}
            >
              <SkipPreviousIcon sx={{ fontSize: 24 }} />
            </IconButton>

            {/* Play/Pause Button */}
            <IconButton
              onClick={togglePlay}
              sx={{
                color: palette.primary,
                backgroundColor: `${palette.primary}15`,
                border: `2px solid ${palette.primary}40`,
                borderRadius: '50%',
                width: 60,
                height: 60,
                '&:hover': {
                  backgroundColor: `${palette.primary}25`,
                  borderColor: palette.primary,
                  transform: 'scale(1.05)',
                  boxShadow: `0 0 20px ${palette.primary}40`,
                }
              }}
            >
              {isPlaying ? <PauseIcon sx={{ fontSize: 30 }} /> : <PlayArrowIcon sx={{ fontSize: 30 }} />}
            </IconButton>

            {/* Next Track */}
            <IconButton
              onClick={playNextTrack}
              disabled={currentTrackIndex === playlist.length - 1}
              sx={{
                color: currentTrackIndex === playlist.length - 1 ? palette.border : palette.secondary,
                '&:hover': {
                  color: palette.accent,
                  transform: currentTrackIndex === playlist.length - 1 ? 'none' : 'scale(1.1)',
                }
              }}
            >
              <SkipNextIcon sx={{ fontSize: 24 }} />
            </IconButton>

            {/* Playlist Toggle */}
            <IconButton
              onClick={() => setShowPlaylist(!showPlaylist)}
              sx={{
                color: showPlaylist ? palette.accent : palette.secondary,
                backgroundColor: showPlaylist ? `${palette.accent}15` : 'transparent',
                border: `2px solid ${showPlaylist ? palette.accent : 'transparent'}40`,
                '&:hover': {
                  color: palette.accent,
                  backgroundColor: `${palette.accent}15`,
                  borderColor: palette.accent + '40',
                  transform: 'scale(1.1)',
                }
              }}
            >
              <QueueMusicIcon sx={{ fontSize: 24 }} />
            </IconButton>

            {/* Volume Control */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
              <IconButton
                onClick={toggleMute}
                sx={{
                  color: palette.secondary,
                  '&:hover': {
                    color: palette.accent,
                    transform: 'scale(1.1)',
                  }
                }}
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
                  width: 80,
                  '& .MuiSlider-thumb': {
                    backgroundColor: palette.secondary,
                    boxShadow: `0 0 8px ${palette.secondary}60`,
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: palette.secondary,
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: palette.border,
                  }
                }}
              />
            </Box>
          </Box>

          {/* Playlist */}
          {showPlaylist && (
            <Card sx={{
              mt: 2,
              background: `linear-gradient(135deg, ${palette.background}C0 0%, ${palette.primary}05 50%, ${palette.secondary}05 100%)`,
              border: `1px solid ${palette.border}30`,
              borderRadius: '8px',
            }}>
              <CardContent sx={{ p: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: palette.primary,
                    fontFamily: 'monospace',
                    mb: 2,
                    textAlign: 'center'
                  }}
                >
                  PLAYLIST
                </Typography>
                <List sx={{ p: 0 }}>
                  {playlist.map((track, index) => (
                    <ListItem key={track.id} sx={{ p: 0 }}>
                      <ListItemButton
                        onClick={() => selectTrack(index)}
                        selected={index === currentTrackIndex}
                        sx={{
                          borderRadius: '6px',
                          mb: 1,
                          backgroundColor: index === currentTrackIndex ? `${palette.primary}15` : 'transparent',
                          border: index === currentTrackIndex ? `1px solid ${palette.primary}40` : '1px solid transparent',
                          '&:hover': {
                            backgroundColor: `${palette.primary}20`,
                            borderColor: palette.primary + '60',
                          }
                        }}
                      >
                        <ListItemText
                          primary={track.title}
                          secondary={track.artist}
                          primaryTypographyProps={{
                            sx: {
                              color: index === currentTrackIndex ? palette.primary : palette.text,
                              fontFamily: 'monospace',
                              fontWeight: index === currentTrackIndex ? 'bold' : 'normal',
                            }
                          }}
                          secondaryTypographyProps={{
                            sx: {
                              color: palette.text,
                              fontFamily: 'monospace',
                              opacity: 0.7,
                            }
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            preload="metadata"
            crossOrigin="anonymous"
          />
        </CardContent>
      </Card>

      {/* Instructions */}
      <Typography 
        sx={{ 
          mt: 3,
          color: palette.text,
          fontFamily: 'monospace',
          textAlign: 'center',
          opacity: 0.7,
          fontSize: '0.9rem'
        }}
      >
        🎵 Equalizer-style audio visualizer with rainbow gradients • Theme colors adapt to your palette
      </Typography>
    </Box>
  );
};

export default MusicSection;