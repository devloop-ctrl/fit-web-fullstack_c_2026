import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const STORAGE_KEY = 'fp_cart_data';
const TAX_RATE = 0.05;
const save = (items) => localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

export const cartTotals = (items) => {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = subtotal * TAX_RATE;
  return { subtotal, tax, total: subtotal + tax };
};

// Checkout: turn the cart into a bill stored in the database
export const checkout = createAsyncThunk('cart/checkout', async (_, { getState, rejectWithValue }) => {
  const { cart: { items }, user: { user } } = getState();
  try {
    const { data } = await axios.post('/api/bills', {
      customerName: user.name || user.username,
      email: user.email,
      items: items.map((i) => `${i.title} (x${i.qty})`).join(', '),
      total: +cartTotals(items).total.toFixed(2),
      status: 'Paid'
    });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const CartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'),
    isDrawerOpen: false
  },
  reducers: {
    toggleCartDrawer: (state, action) => {
      state.isDrawerOpen = action.payload ?? !state.isDrawerOpen;
    },
    addToCart: (state, action) => {
      const { id, title, price, color, image } = action.payload;
      const existing = state.items.find((i) => i.id === id);
      if (existing) existing.qty += 1;
      else state.items.push({ id, title, price, color, image, qty: 1 });
      save(state.items);
    },
    updateCartQty: (state, action) => {
      const { id, delta } = action.payload;
      state.items = state.items
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0);
      save(state.items);
    }
  },
  extraReducers: (builder) => {
    builder.addCase(checkout.fulfilled, (state) => {
      state.items = [];
      state.isDrawerOpen = false;
      save([]);
    });
  }
});

export const { toggleCartDrawer, addToCart, updateCartQty } = CartSlice.actions;
export default CartSlice.reducer;
