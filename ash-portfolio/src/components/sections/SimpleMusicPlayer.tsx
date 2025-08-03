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
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  palette: any;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioRef, isPlaying, palette }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const setupAudioContext = useCallback(() => {
    if (!audioRef.current || sourceRef.current) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
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

    if (analyserRef.current && isPlaying) {
      try {
        bufferLength = analyserRef.current.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
      } catch (error) {
        bufferLength = 128;
        dataArray = new Uint8Array(bufferLength);
        const time = Date.now() * 0.001;
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.floor((Math.sin(time * 2 + i * 0.1) * 0.5 + 0.5) * 255 * 0.5);
        }
      }
    } else {
      bufferLength = 128;
      dataArray = new Uint8Array(bufferLength);
      const time = Date.now() * 0.001;
      for (let i = 0; i < bufferLength; i++) {
        dataArray[i] = Math.floor((Math.sin(time * 2 + i * 0.1) * 0.5 + 0.5) * 255 * 0.3);
      }
    }

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw bars
    const barWidth = canvas.width / bufferLength;
    const maxBarHeight = canvas.height * 0.8;
    
    for (let i = 0; i < bufferLength; i++) {
      const amplitude = dataArray[i] / 255;
      const barHeight = amplitude * maxBarHeight;
      const x = i * barWidth;
      const y = canvas.height - barHeight;

      const hue = (i / bufferLength) * 360;
      const saturation = 70 + amplitude * 30;
      const lightness = 50 + amplitude * 30;
      
      ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    }

    animationRef.current = requestAnimationFrame(draw);
  }, [isPlaying]);

  useEffect(() => {
    draw();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
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
        background: `linear-gradient(135deg, ${palette.background}40 0%, ${palette.primary}08 50%, ${palette.secondary}08 100%)`,
        border: `2px solid ${palette.border}30`,
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

const SimpleMusicPlayer: React.FC = () => {
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

  // Simple event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  // Simple play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((error) => {
          console.error('Play failed:', error);
          setIsPlaying(false);
        });
    }
  };

  const playNextTrack = () => {
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      setIsPlaying(false);
    }
  };

  const playPreviousTrack = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
      setIsPlaying(false);
    }
  };

  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(false);
    setShowPlaylist(false);
  };

  const handleSeek = (event: Event, newValue: number | number[]) => {
    if (!audioRef.current) return;
    const time = Array.isArray(newValue) ? newValue[0] : newValue;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const vol = Array.isArray(newValue) ? newValue[0] : newValue;
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    audioRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const formatTime = (time: number) => {
    if (!isFinite(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Set up audio element when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset state
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    // Set up new track
    audio.src = currentTrack.url;
    audio.volume = volume;
    audio.muted = isMuted;
    audio.load();
  }, [currentTrack.url]);

  // Set up volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

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
                    transform: 'scale(1.1)',
                  }
                }}
              >
                {isPlaying ? <PauseIcon sx={{ fontSize: 32 }} /> : <PlayArrowIcon sx={{ fontSize: 32 }} />}
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
        <AudioVisualizer 
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
        onEnded={handleEnded}
        preload="metadata"
      />
    </Box>
  );
};

export default SimpleMusicPlayer;