import { createSlice } from '@reduxjs/toolkit';

const loadCart = () => {
  try {
    const raw = localStorage.getItem('fp_cart_data');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  try {
    localStorage.setItem('fp_cart_data', JSON.stringify(items));
  } catch (err) {
    console.error('Error saving cart to storage', err);
  }
};

const initialItems = loadCart();

export const CartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: initialItems,
    isDrawerOpen: false
  },
  reducers: {
    toggleCartDrawer: (state, action) => {
      state.isDrawerOpen = action.payload !== undefined ? action.payload : !state.isDrawerOpen;
    },
    addToCart: (state, action) => {
      const shirt = action.payload;
      const existing = state.items.find(i => i.id === shirt.id);
      if (existing) {
        existing.qty += 1;
      } else {
        state.items.push({
          id: shirt.id,
          title: shirt.title,
          price: shirt.price,
          qty: 1,
          color: shirt.color,
          image: shirt.image
        });
      }
      saveCart(state.items);
    },
    updateCartQty: (state, action) => {
      const { id, delta } = action.payload;
      const item = state.items.find(i => i.id === id);
      if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
          state.items = state.items.filter(i => i.id !== id);
        }
      }
      saveCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCart([]);
    }
  }
});

export const { toggleCartDrawer, addToCart, updateCartQty, clearCart } = CartSlice.actions;
export default CartSlice.reducer;

