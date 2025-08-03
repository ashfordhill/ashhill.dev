import React, { useState, useRef, useEffect } from 'react';
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

  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return;

    const setupAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        
        if (!sourceRef.current) {
          sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current!);
          sourceRef.current.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
        }
      }
    };

    const draw = () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      let dataArray: Uint8Array;
      let bufferLength: number;

      if (analyserRef.current && audioRef.current && !audioRef.current.paused) {
        // Real audio data
        bufferLength = analyserRef.current.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
      } else {
        // Demo mode - simulate audio data
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
      ctx.fillStyle = `${palette.background}15`;
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
        
        gradient.addColorStop(0, rainbowColor);
        gradient.addColorStop(0.5, `${baseColor}${Math.floor(amplitude * 100 + 50).toString(16).padStart(2, '0')}`);
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
        reflectionGradient.addColorStop(0, `${rainbowColor}40`);
        reflectionGradient.addColorStop(1, `${rainbowColor}00`);
        
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
          ctx.fillStyle = `${rainbowColor}${Math.floor(amplitude * 200).toString(16).padStart(2, '0')}`;
          
          // Floating particles
          const time = Date.now() * 0.002;
          const offsetX = Math.sin(time + i * 0.1) * 20;
          const offsetY = Math.cos(time + i * 0.1) * 10;
          
          ctx.beginPath();
          ctx.arc(x + offsetX, y + offsetY - 20, particleSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Always animate, but with different intensity
      animationRef.current = requestAnimationFrame(draw);
    };

    if (isPlaying && audioRef.current && audioRef.current.src) {
      setupAudioContext();
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
    }
    
    // Start animation loop
    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, palette]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
      style={{
        width: '100%',
        height: '300px',
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${palette.background}40 0%, ${palette.primary}08 50%, ${palette.secondary}08 100%)`,
        border: `2px solid ${palette.border}30`,
        boxShadow: `0 0 20px ${palette.primary}20, inset 0 0 20px ${palette.secondary}10`
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      // Auto-play next track
      if (currentTrackIndex < playlist.length - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, playlist.length]);

  // Load current track when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = currentTrack.url;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
  }, [currentTrack]);

  const togglePlay = () => {
    if (audioRef.current && audioRef.current.src) {
      // Real audio mode
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNextTrack = () => {
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      setIsPlaying(true);
    }
  };

  const playPreviousTrack = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
      setIsPlaying(true);
    }
  };

  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
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
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 3,
      background: `linear-gradient(135deg, ${palette.background}F0 0%, ${palette.primary}05 25%, ${palette.secondary}05 50%, ${palette.accent}05 75%, ${palette.background}F0 100%)`,
    }}>
      <Card sx={{
        maxWidth: 600,
        width: '100%',
        background: `linear-gradient(135deg, ${palette.background}E0 0%, ${palette.primary}08 50%, ${palette.secondary}08 100%)`,
        border: `2px solid ${palette.border}40`,
        borderRadius: '16px',
        boxShadow: `0 8px 32px ${palette.border}30, inset 0 1px 0 ${palette.primary}20`,
        backdropFilter: 'blur(10px)',
      }}>
        <CardContent sx={{ p: 4 }}>
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
              max={duration || 100}
              onChange={handleSeek}
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