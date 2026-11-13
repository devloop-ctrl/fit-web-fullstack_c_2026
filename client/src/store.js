import { configureStore } from "@reduxjs/toolkit";
import UserSlice from "./features/UserSlice";
import CartSlice from "./features/CartSlice";
import FitnessSlice from "./features/FitnessSlice";

export const store = configureStore({
  reducer: {
    user: UserSlice,
    cart: CartSlice,
    fitness: FitnessSlice
  }
});

export default store;
