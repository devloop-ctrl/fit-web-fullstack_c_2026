// ============================================================
// CartSlice: shopping cart items, drawer visibility, and checkout
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ------------------------------------------------------------
// 2. Async thunk (talk to the server)
// ------------------------------------------------------------

// CREATE a bill in the database when the member pays
export const checkout = createAsyncThunk('cart/checkout', async (bill, { rejectWithValue }) => {
  try {
    const res = await axios.post('/api/bills', bill);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// ------------------------------------------------------------
// 3. Slice (state + reducers)
// ------------------------------------------------------------

// Save the cart in the browser so it stays after refresh
const saveCart = (items) => {
  localStorage.setItem('fp_cart_data', JSON.stringify(items));
};

const CartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: JSON.parse(localStorage.getItem('fp_cart_data') || '[]'),
    isDrawerOpen: false
  },

  reducers: {
    // Open or close the drawer (true / false)
    toggleCartDrawer: (state, action) => {
      state.isDrawerOpen = action.payload;
    },

    // Add a shirt, or +1 if it is already in the cart
    addToCart: (state, action) => {
      const shirt = action.payload;
      const existing = state.items.find((item) => item.id === shirt.id);

      if (existing) {
        existing.qty += 1;
      } else {
        state.items.push({ id: shirt.id, title: shirt.title, price: shirt.price, qty: 1 });
      }
      saveCart(state.items);
    },

    // Change quantity by +1 or -1 (remove the item when it reaches 0)
    updateCartQty: (state, action) => {
      const item = state.items.find((x) => x.id === action.payload.id);
      if (!item) return;

      item.qty += action.payload.delta;

      if (item.qty <= 0) {
        state.items = state.items.filter((x) => x.id !== item.id);
      }
      saveCart(state.items);
    }
  },

  // After payment: empty the cart and close the drawer
  extraReducers: (builder) => {
    builder.addCase(checkout.fulfilled, (state) => {
      state.items = [];
      state.isDrawerOpen = false;
      saveCart([]);
    });
  }
});

// ------------------------------------------------------------
// 4. Exports
// ------------------------------------------------------------
export const { toggleCartDrawer, addToCart, updateCartQty } = CartSlice.actions;
export default CartSlice.reducer;
