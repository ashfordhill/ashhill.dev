import { configureStore } from '@reduxjs/toolkit';
import navigationReducer from './slices/navigationSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;