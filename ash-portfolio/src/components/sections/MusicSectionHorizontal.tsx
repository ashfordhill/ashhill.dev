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
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
      }
      
      if (!sourceRef.current && audioRef.current) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        isSetupRef.current = true;
      }
    } catch (error) {
      console.warn('AudioContext setup failed:', error);
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
      try {
        bufferLength = analyserRef.current.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
      } catch (error) {
        bufferLength = 128;
        dataArray = new Uint8Array(bufferLength);
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
      bufferLength = 128;
      dataArray = new Uint8Array(bufferLength);
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

    // Create equalizer-style visualization
    const barWidth = canvas.width / bufferLength;
    const maxBarHeight = canvas.height * 0.8;
    
    const getRainbowColor = (index: number, total: number, amplitude: number) => {
      const hue = (index / total) * 360;
      const saturation = 70 + amplitude * 30;
      const lightness = 50 + amplitude * 30;
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    for (let i = 0; i < bufferLength; i++) {
      const amplitude = dataArray[i] / 255;
      const barHeight = amplitude * maxBarHeight;
      const x = i * barWidth;
      const y = canvas.height - barHeight;

      const gradient = ctx.createLinearGradient(x, canvas.height, x, y);
      const rainbowColor = getRainbowColor(i, bufferLength, amplitude);
      
      const baseColor = i < bufferLength / 3 ? palette.primary : 
                       i < bufferLength * 2 / 3 ? palette.secondary : palette.accent;
      
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

      if (amplitude > 0.4) {
        ctx.shadowColor = rainbowColor;
        ctx.shadowBlur = 10 + amplitude * 20;
        ctx.fillRect(x, y, barWidth - 1, barHeight);
        ctx.shadowBlur = 0;
      }
    }

    animationRef.current = requestAnimationFrame(draw);
  }, [audioRef, isPlaying, palette]);

  useEffect(() => {
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
      width={800}
      height={400}
      style={{
        width: '100%',
        height: '100%',
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

const MusicSectionHorizontal: React.FC = () => {
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
  const [isLoading, setIsLoading] = useState(false);

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

  const lastUpdateRef = useRef<number>(0);
  
  const updateTime = useCallback(() => {
    if (audioRef.current && !isLoading) {
      const now = Date.now();
      // Throttle updates to every 100ms
      if (now - lastUpdateRef.current < 100) return;
      
      const time = audioRef.current.currentTime;
      if (isFinite(time) && time >= 0 && time <= 86400) { // Max 24 hours
        setCurrentTime(time);
        lastUpdateRef.current = now;
      }
    }
  }, [isLoading]);

  const updateDuration = useCallback(() => {
    if (audioRef.current) {
      const dur = audioRef.current.duration;
      if (isFinite(dur) && dur > 0) {
        setDuration(dur);
      }
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
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

  // Initialize audio element once
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.muted = isMuted;
  }, []);

  // Only load when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isLoading) return;

    setIsLoading(true);
    try {
      audio.src = currentTrack.url;
      audio.load();
      setCurrentTime(0);
      setDuration(0);
      setError(null);
      setIsPlaying(false); // Reset playing state when track changes
    } catch (err) {
      console.error('Failed to load track:', err);
      setError('Failed to load track');
    } finally {
      setTimeout(() => setIsLoading(false), 100); // Small delay to prevent rapid updates
    }
  }, [currentTrack.url, isLoading]); // Only depend on URL, not volume/mute

  // Handle volume changes separately
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.muted = isMuted;
    }
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Don't reload if src is already set
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
  }, [isPlaying]);

  const playNextTrack = useCallback(() => {
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      setIsPlaying(false);
    }
  }, [currentTrackIndex, playlist.length]);

  const playPreviousTrack = useCallback(() => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
      setIsPlaying(false);
    }
  }, [currentTrackIndex]);

  const selectTrack = useCallback((index: number) => {
    setCurrentTrackIndex(index);
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
    if (!isFinite(time) || time < 0 || time > 86400) return '0:00'; // Max 24 hours
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
      height: '100vh',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      background: `linear-gradient(135deg, ${palette.background}F0 0%, ${palette.primary}05 25%, ${palette.secondary}05 50%, ${palette.accent}05 75%, ${palette.background}F0 100%)`,
      overflow: 'hidden',
    }}>
      {/* Left Side - Track Info & Controls */}
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
          boxShadow: `0 8px 32px ${palette.border}30, inset 0 1px 0 ${palette.primary}20`,
          backdropFilter: 'blur(10px)',
        }}>
          <CardContent sx={{ p: 3 }}>
            {/* Error Display */}
            {error && (
              <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>
                {error}
              </Alert>
            )}

            {/* Track Info */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: palette.primary,
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  mb: 1,
                  textShadow: `0 0 10px ${palette.primary}40`
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
                value={isFinite(currentTime) ? currentTime : 0}
                max={isFinite(duration) && duration > 0 ? duration : 100}
                onChange={handleSeek}
                disabled={!isFinite(duration) || duration === 0}
                sx={{
                  color: palette.primary,
                  '& .MuiSlider-thumb': {
                    backgroundColor: palette.primary,
                    boxShadow: `0 0 10px ${palette.primary}60`,
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: palette.primary,
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: palette.border,
                  }
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
              {/* Previous Track */}
              <IconButton
                onClick={playPreviousTrack}
                disabled={currentTrackIndex === 0}
                sx={{
                  color: currentTrackIndex === 0 ? palette.border : palette.secondary,
                  '&:hover': { color: palette.accent, transform: 'scale(1.1)' }
                }}
              >
                <SkipPreviousIcon sx={{ fontSize: 28 }} />
              </IconButton>

              {/* Play/Pause */}
              <IconButton
                onClick={togglePlay}
                sx={{
                  color: palette.primary,
                  backgroundColor: `${palette.primary}15`,
                  border: `2px solid ${palette.primary}40`,
                  borderRadius: '50%',
                  width: 56,
                  height: 56,
                  '&:hover': {
                    color: palette.accent,
                    backgroundColor: `${palette.accent}15`,
                    borderColor: palette.accent + '40',
                    transform: 'scale(1.1)',
                  }
                }}
              >
                {isPlaying ? <PauseIcon sx={{ fontSize: 32 }} /> : <PlayArrowIcon sx={{ fontSize: 32 }} />}
              </IconButton>

              {/* Next Track */}
              <IconButton
                onClick={playNextTrack}
                disabled={currentTrackIndex === playlist.length - 1}
                sx={{
                  color: currentTrackIndex === playlist.length - 1 ? palette.border : palette.secondary,
                  '&:hover': { color: palette.accent, transform: 'scale(1.1)' }
                }}
              >
                <SkipNextIcon sx={{ fontSize: 28 }} />
              </IconButton>
            </Box>

            {/* Volume & Playlist Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Volume Control */}
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

              {/* Playlist Toggle */}
              <IconButton
                onClick={() => setShowPlaylist(!showPlaylist)}
                sx={{
                  color: showPlaylist ? palette.accent : palette.secondary,
                  backgroundColor: showPlaylist ? `${palette.accent}15` : 'transparent',
                  '&:hover': { color: palette.accent, backgroundColor: `${palette.accent}15` }
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

        {/* Info Alert */}
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

      {/* Right Side - Audio Visualizer */}
      <Box sx={{
        flex: 1,
        height: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <AudioVisualizer 
          audioRef={audioRef} 
          isPlaying={isPlaying} 
          palette={palette} 
        />
      </Box>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        preload="metadata"
        crossOrigin="anonymous"
      />
    </Box>
  );
};

export default MusicSectionHorizontal;