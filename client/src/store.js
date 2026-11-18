import { configureStore } from '@reduxjs/toolkit';
import user from './features/UserSlice';
import cart from './features/CartSlice';
import fitness from './features/FitnessSlice';

export const store = configureStore({
  reducer: { user, cart, fitness }
});
