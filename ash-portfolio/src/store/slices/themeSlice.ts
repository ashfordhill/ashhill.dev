import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ColorPalette {
  name: string;
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  grid: string;
  obstacle: string;
  car: string;
  destination: string;
  spawn: string;
  border: string;
  text: string;
}

export const colorPalettes = {
  cyberpunk: {
    name: 'Cyberpunk',
    background: '#0a0a0f',
    primary: '#ff00ff',
    secondary: '#00ffff',
    accent: '#ffff00',
    grid: '#1a1a2e',
    obstacle: '#16213e',
    car: '#00ffff',
    destination: '#ff00ff',
    spawn: '#ffff00',
    border: '#ff00ff',
    text: '#00ffff'
  },
  neon: {
    name: 'Neon',
    background: '#000814',
    primary: '#ff006e',
    secondary: '#8338ec',
    accent: '#3a86ff',
    grid: '#001d3d',
    obstacle: '#003566',
    car: '#ff006e',
    destination: '#8338ec',
    spawn: '#3a86ff',
    border: '#ff006e',
    text: '#ffffff'
  },
  matrix: {
    name: 'Matrix',
    background: '#000000',
    primary: '#00ff00',
    secondary: '#008f11',
    accent: '#00ff41',
    grid: '#001100',
    obstacle: '#003300',
    car: '#00ff00',
    destination: '#00ff41',
    spawn: '#008f11',
    border: '#00ff00',
    text: '#00ff00'
  },
  galaxy: {
    name: 'Galaxy',
    background: '#0B0B1A',
    primary: '#9D4EDD',
    secondary: '#7209B7',
    accent: '#F72585',
    grid: '#1A1A2E',
    obstacle: '#16213E',
    car: '#9D4EDD',
    destination: '#F72585',
    spawn: '#7209B7',
    border: '#9D4EDD',
    text: '#E0AAFF'
  }
} as const;

export type PaletteKey = keyof typeof colorPalettes;

interface ThemeState {
  currentPalette: PaletteKey;
}

const initialState: ThemeState = {
  currentPalette: 'galaxy', // Default to the new galaxy theme
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setPalette: (state, action: PayloadAction<PaletteKey>) => {
      state.currentPalette = action.payload;
    },
  },
});

export const { setPalette } = themeSlice.actions;
export default themeSlice.reducer;