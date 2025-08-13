import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { Box } from '@mui/material';
import * as PIXI from 'pixi.js';

interface PixiAudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  palette: any;
}

const PixiAudioVisualizer: React.FC<PixiAudioVisualizerProps> = React.memo(({ audioRef, isPlaying, palette }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array>(new Uint8Array(0));
  const isInitializedRef = useRef(false);
  const barsRef = useRef<PIXI.Graphics[]>([]);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const [isContainerReady, setIsContainerReady] = React.useState(false);

  // Configuration
  const config = useMemo(() => ({
    width: 800,
    height: 400,
    barCount: 64,
    maxBarHeight: 300,
    minBarHeight: 10,
  }), []);

  // Initialize Pixi.js application
  const initPixi = useCallback(async () => {
    // Add more robust checks
    if (!containerRef.current || appRef.current) {
      console.log('InitPixi skipped:', { 
        hasContainer: !!containerRef.current, 
        hasApp: !!appRef.current 
      });
      return;
    }

    try {
      const app = new PIXI.Application();
      await app.init({
        width: config.width,
        height: config.height,
        backgroundColor: 0x000000,
        backgroundAlpha: 0.1,
        antialias: true,
      });

      // Double-check container still exists after async init
      if (!containerRef.current) {
        console.warn('Container disappeared during Pixi init');
        app.destroy(true);
        return;
      }

      containerRef.current.appendChild(app.canvas);
      appRef.current = app;

      // Create bars
      const bars: PIXI.Graphics[] = [];
      const barWidth = config.width / config.barCount;

      for (let i = 0; i < config.barCount; i++) {
        const bar = new PIXI.Graphics();
        bar.x = i * barWidth + barWidth / 2;
        bar.y = config.height;
        app.stage.addChild(bar);
        bars.push(bar);
      }
      barsRef.current = bars;

      console.log('Pixi.js initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Pixi.js:', error);
    }
  }, [config]);

  // Setup audio context with better error handling
  const setupAudioContext = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      // Reset if already initialized but context is closed
      if (audioContextRef.current && audioContextRef.current.state === 'closed') {
        audioContextRef.current = null;
        sourceRef.current = null;
        analyserRef.current = null;
        isInitializedRef.current = false;
      }

      // Skip if already properly initialized
      if (sourceRef.current && isInitializedRef.current && 
          audioContextRef.current && audioContextRef.current.state !== 'closed') {
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Ensure AudioContext is running
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Only create new nodes if they don't exist
      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.8;
      }

      // Only create source if it doesn't exist
      if (!sourceRef.current) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }
      
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      isInitializedRef.current = true;
      
      console.log('AudioContext setup successful');
    } catch (error) {
      console.warn('AudioContext setup failed:', error);
      // Create fallback data array
      dataArrayRef.current = new Uint8Array(config.barCount);
      // Don't mark as initialized so it can retry later
      isInitializedRef.current = false;
    }
  }, [audioRef, config.barCount]);

  // Animation loop
  const animate = useCallback(() => {
    if (!appRef.current || !isPlaying) return;

    timeRef.current += 0.05;
    let dataArray = dataArrayRef.current;
    let hasRealData = false;

    // Get audio data
    if (analyserRef.current && audioContextRef.current?.state === 'running') {
      try {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const tempArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(tempArray);
        
        const hasData = tempArray.some(value => value > 0);
        if (hasData) {
          dataArray = tempArray;
          dataArrayRef.current = dataArray;
          hasRealData = true;
        }
      } catch (error) {
        console.warn('Error getting frequency data:', error);
      }
    }

    // Generate fallback data if no real audio data
    if (!hasRealData) {
      if (dataArray.length !== config.barCount) {
        dataArray = new Uint8Array(config.barCount);
        dataArrayRef.current = dataArray;
      }
      
      for (let i = 0; i < config.barCount; i++) {
        const wave1 = Math.sin(timeRef.current + i * 0.1) * 0.5 + 0.5;
        const wave2 = Math.sin(timeRef.current * 1.5 + i * 0.05) * 0.3 + 0.3;
        const wave3 = Math.sin(timeRef.current * 0.8 + i * 0.2) * 0.2 + 0.2;
        const combined = (wave1 + wave2 + wave3) / 3;
        dataArray[i] = Math.floor(combined * 200 + 55);
      }
    }

    // Update bars
    const bars = barsRef.current;
    const barWidth = config.width / config.barCount;

    for (let i = 0; i < Math.min(bars.length, dataArray.length); i++) {
      const bar = bars[i];
      const amplitude = dataArray[i] / 255;
      const barHeight = Math.max(amplitude * config.maxBarHeight, config.minBarHeight);
      
      // Rainbow color based on position and time
      const hue = (i / config.barCount) * 360 + (timeRef.current * 30) % 360;
      const saturation = 70 + amplitude * 30;
      const lightness = 50 + amplitude * 30;
      
      // Convert HSL to RGB for Pixi
      const color = hslToHex(hue, saturation, lightness);
      
      bar.clear();
      bar.rect(-barWidth / 2 + 2, -barHeight, barWidth - 4, barHeight);
      bar.fill(color);
      
      // Add glow effect for high amplitudes
      if (amplitude > 0.5) {
        bar.rect(-barWidth / 2, -barHeight - 5, barWidth, barHeight + 10);
        bar.fill({ color, alpha: 0.3 });
      }
    }

    // Continue animation
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isPlaying, config]);

  // HSL to Hex conversion for Pixi
  const hslToHex = useCallback((h: number, s: number, l: number): number => {
    h = h % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return (r << 16) | (g << 8) | b;
  }, []);

  // Start/stop animation with retry logic
  useEffect(() => {
    if (isPlaying) {
      if (!isInitializedRef.current) {
        setupAudioContext();
        // Retry setup after a delay if it failed
        setTimeout(() => {
          if (!isInitializedRef.current && isPlaying) {
            console.log('Retrying audio context setup...');
            setupAudioContext();
          }
        }, 1000);
      }
      
      // Resume AudioContext if suspended
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().then(() => {
          console.log('AudioContext resumed');
        }).catch(console.warn);
      }
      
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, animate, setupAudioContext]);

  // Initialize Pixi when container is ready
  useEffect(() => {
    if (isContainerReady) {
      initPixi();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.warn);
      }
    };
  }, [isContainerReady, initPixi]);

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative'
    }}>
      <div 
        ref={(el) => {
          containerRef.current = el;
          if (el && !isContainerReady) {
            setIsContainerReady(true);
          }
        }}
        style={{ 
          borderRadius: '12px',
          overflow: 'hidden',
          border: `2px solid ${palette.border}30`,
          background: `linear-gradient(135deg, ${palette.background}40 0%, ${palette.primary}08 50%, ${palette.secondary}08 100%)`,
        }} 
      />
      

    </Box>
  );
});

export default PixiAudioVisualizer;