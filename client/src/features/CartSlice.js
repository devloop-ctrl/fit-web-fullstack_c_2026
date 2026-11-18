// ============================================================
// CartSlice: shopping cart items, drawer visibility, and checkout
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ------------------------------------------------------------
// 2. Constants and small helpers
// ------------------------------------------------------------
const STORAGE_KEY = 'fp_cart_data';
const TAX_RATE = 0.05; // 5% tax

// Save the cart in the browser so it survives a refresh
const saveCart = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

// Calculate subtotal, tax, and total from the cart items
export const cartTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * TAX_RATE;
  return { subtotal, tax, total: subtotal + tax };
};

// ------------------------------------------------------------
// 3. Async thunks (talk to the server)
// ------------------------------------------------------------

// Checkout: turn the cart into a bill saved in the database
export const checkout = createAsyncThunk('cart/checkout', async (_, { getState, rejectWithValue }) => {
  const { cart, user } = getState();

  try {
    const { data } = await axios.post('/api/bills', {
      customerName: user.user.name || user.user.username,
      email: user.user.email,
      items: cart.items.map((item) => `${item.title} (x${item.qty})`).join(', '),
      total: +cartTotals(cart.items).total.toFixed(2),
      status: 'Paid'
    });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// ------------------------------------------------------------
// 4. Slice (state + reducers)
// ------------------------------------------------------------
const CartSlice = createSlice({
  name: 'cart',

  // Start with the cart saved in the browser (or empty)
  initialState: {
    items: JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'),
    isDrawerOpen: false
  },

  reducers: {
    // Open or close the cart drawer
    toggleCartDrawer: (state, action) => {
      state.isDrawerOpen = action.payload ?? !state.isDrawerOpen;
    },

    // Add a shirt (or increase its quantity if it is already in the cart)
    addToCart: (state, action) => {
      const { id, title, price, color, image } = action.payload;
      const existing = state.items.find((item) => item.id === id);

      if (existing) {
        existing.qty += 1;
      } else {
        state.items.push({ id, title, price, color, image, qty: 1 });
      }
      saveCart(state.items);
    },

    // Change a quantity by +1 or -1 (the item is removed when it reaches 0)
    updateCartQty: (state, action) => {
      const { id, delta } = action.payload;

      state.items = state.items
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0);
      saveCart(state.items);
    }
  },

  // After a successful checkout: empty the cart and close the drawer
  extraReducers: (builder) => {
    builder.addCase(checkout.fulfilled, (state) => {
      state.items = [];
      state.isDrawerOpen = false;
      saveCart([]);
    });
  }
});

// ------------------------------------------------------------
// 5. Exports
// ------------------------------------------------------------
export const { toggleCartDrawer, addToCart, updateCartQty } = CartSlice.actions;
export default CartSlice.reducer;
