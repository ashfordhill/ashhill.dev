import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NavigationSection = 'about' | 'fun' | 'cicd' | 'music';

interface NavigationState {
  currentSection: NavigationSection;
}

const initialState: NavigationState = {
  currentSection: 'fun', // Default to Fun section (which contains Pathfinder)
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setCurrentSection: (state, action: PayloadAction<NavigationSection>) => {
      state.currentSection = action.payload;
    },
  },
});

export const { setCurrentSection } = navigationSlice.actions;
export default navigationSlice.reducer;