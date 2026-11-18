// ============================================================
// Redux store: combines all the slices in one place
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { configureStore } from '@reduxjs/toolkit';
import user from './features/UserSlice';
import cart from './features/CartSlice';
import fitness from './features/FitnessSlice';

// ------------------------------------------------------------
// 2. Create the store
// ------------------------------------------------------------
export const store = configureStore({
  reducer: { user, cart, fitness }
});
