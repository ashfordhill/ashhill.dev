import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  IconButton, 
  Typography, 
  Slider,
  Card,
  CardContent
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
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
      ctx.fillStyle = `${palette.background}20`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create watercolor-style visualization
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw multiple layers for watercolor effect
      for (let layer = 0; layer < 3; layer++) {
        ctx.globalCompositeOperation = layer === 0 ? 'source-over' : 'multiply';
        
        for (let i = 0; i < bufferLength; i++) {
          const amplitude = dataArray[i] / 255;
          const angle = (i / bufferLength) * Math.PI * 2;
          const radius = 50 + amplitude * (100 + layer * 30);
          
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          // Create gradient for watercolor effect
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20 + amplitude * 30);
          
          // Use theme colors with varying opacity
          const colors = [palette.primary, palette.secondary, palette.accent];
          const color = colors[layer];
          
          gradient.addColorStop(0, `${color}${Math.floor(amplitude * 100 + 20).toString(16).padStart(2, '0')}`);
          gradient.addColorStop(0.5, `${color}${Math.floor(amplitude * 60 + 10).toString(16).padStart(2, '0')}`);
          gradient.addColorStop(1, `${color}00`);
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, 15 + amplitude * 25, 0, Math.PI * 2);
          ctx.fill();
          
          // Add flowing particles
          if (amplitude > 0.3) {
            const particleX = x + Math.cos(Date.now() * 0.001 + i) * (amplitude * 20);
            const particleY = y + Math.sin(Date.now() * 0.001 + i) * (amplitude * 20);
            
            ctx.fillStyle = `${color}${Math.floor(amplitude * 150).toString(16).padStart(2, '0')}`;
            ctx.beginPath();
            ctx.arc(particleX, particleY, 2 + amplitude * 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Add central pulse
      const avgAmplitude = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength / 255;
      const pulseGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40 + avgAmplitude * 60);
      pulseGradient.addColorStop(0, `${palette.primary}${Math.floor(avgAmplitude * 100 + 50).toString(16).padStart(2, '0')}`);
      pulseGradient.addColorStop(0.7, `${palette.secondary}${Math.floor(avgAmplitude * 80 + 30).toString(16).padStart(2, '0')}`);
      pulseGradient.addColorStop(1, `${palette.accent}00`);
      
      ctx.fillStyle = pulseGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 20 + avgAmplitude * 40, 0, Math.PI * 2);
      ctx.fill();

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

const MusicSection: React.FC = () => {
  const currentPalette = useAppSelector((state) => state.theme.currentPalette);
  const palette = colorPalettes[currentPalette];
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);

  // Demo audio URL - you can replace this with your own audio files
  const demoTrack = {
    title: "Cyberpunk Dreams",
    artist: "AI Generated",
    url: "" // Will be replaced with actual audio file
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current && audioRef.current.src) {
      // Real audio mode
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
    // Demo mode - just toggle the state
    setIsPlaying(!isPlaying);
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
              {demoTrack.title}
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: palette.text,
                fontFamily: 'monospace',
                opacity: 0.8
              }}
            >
              {demoTrack.artist}
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
            gap: 2 
          }}>
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

          {/* Hidden Audio Element - Demo Mode */}
          <audio
            ref={audioRef}
            preload="none"
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
        🎵 Watercolor audio visualizer • Demo mode active • Theme colors adapt to your palette
      </Typography>
    </Box>
  );
};

export default MusicSection;