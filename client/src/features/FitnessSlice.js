// ============================================================
// FitnessSlice: data loaded from the database + toast messages
// (workouts, t-shirts, records, and for admin: users and bills)
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { logout } from './UserSlice';

// ------------------------------------------------------------
// 2. Constants and small helpers
// ------------------------------------------------------------

// Get a readable error message from a failed request
const getErrorMessage = (err) => err.response?.data?.message || err.message;

// Send a GET request and return only the data
const getData = (url, params) => axios.get(url, { params }).then((res) => res.data);

// The state before anything is loaded
const initialState = {
  workoutCategory: 'all',
  users: [],
  bills: [],
  workouts: [],
  tshirts: [],
  records: [],
  toasts: []
};

// ------------------------------------------------------------
// 3. Async thunks (talk to the server)
// ------------------------------------------------------------

// Load everything the signed-in user is allowed to see
// (admins also get users, bills, and ALL records)
export const fetchAll = createAsyncThunk('fitness/fetchAll', async (user) => {
  const isAdmin = user.role === 'Admin';

  const [workouts, tshirts, records, users, bills] = await Promise.all([
    getData('/api/workouts'),
    getData('/api/tshirts'),
    getData('/api/records', isAdmin ? { isAdmin: true } : { userId: user.id }),
    isAdmin ? getData('/api/users') : [],
    isAdmin ? getData('/api/bills') : []
  ]);

  return { workouts, tshirts, records, users, bills };
});

// Create (no id) or update (with id) an item: users | workouts | tshirts | records
export const saveItem = createAsyncThunk('fitness/saveItem', async ({ type, id, data }, { rejectWithValue }) => {
  try {
    const res = id ? await axios.put(`/api/${type}/${id}`, data) : await axios.post(`/api/${type}`, data);
    return { type, id, item: res.data };
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

// Delete an item from the database
export const deleteItem = createAsyncThunk('fitness/deleteItem', async ({ type, id }, { rejectWithValue }) => {
  try {
    await axios.delete(`/api/${type}/${id}`);
    return { type, id };
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

// ------------------------------------------------------------
// 4. Slice (state + reducers)
// ------------------------------------------------------------
const FitnessSlice = createSlice({
  name: 'fitness',
  initialState,

  // Normal (instant) actions
  reducers: {
    setWorkoutCategory: (state, action) => {
      state.workoutCategory = action.payload;
    },

    addToast: (state, action) => {
      state.toasts.push({ id: `${Date.now()}${Math.random()}`, message: action.payload });
    },

    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    }
  },

  // Actions that come from the async thunks above
  extraReducers: (builder) => {
    builder
      // When the user logs out, clear all data
      .addCase(logout, () => initialState)

      // Data loaded successfully: put it all in the state
      .addCase(fetchAll.fulfilled, (state, action) => ({ ...state, ...action.payload }))

      // Data failed to load: show a message
      .addCase(fetchAll.rejected, (state, action) => {
        state.toasts.push({ id: `${Date.now()}`, message: `Could not load data: ${action.error.message}` });
      })

      // Item saved: replace it in the list (edit) or add it to the top (new)
      .addCase(saveItem.fulfilled, (state, action) => {
        const { type, id, item } = action.payload;
        if (id) {
          state[type] = state[type].map((x) => (x.id === id ? item : x));
        } else {
          state[type].unshift(item);
        }
      })

      // Item deleted: remove it from the list
      .addCase(deleteItem.fulfilled, (state, action) => {
        const { type, id } = action.payload;
        state[type] = state[type].filter((x) => x.id !== id);
      });
  }
});

// ------------------------------------------------------------
// 5. Exports
// ------------------------------------------------------------
export const { setWorkoutCategory, addToast, removeToast } = FitnessSlice.actions;
export default FitnessSlice.reducer;
