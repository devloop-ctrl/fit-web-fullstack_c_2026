import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { logout } from './UserSlice';

const errorMessage = (err) => err.response?.data?.message || err.message;

// Load everything the signed-in user is allowed to see (admins also get users, bills, and all records)
export const fetchAll = createAsyncThunk('fitness/fetchAll', async (user) => {
  const isAdmin = user.role === 'Admin';
  const get = (url, params) => axios.get(url, { params }).then((res) => res.data);

  const [workouts, tshirts, records, users, bills] = await Promise.all([
    get('/api/workouts'),
    get('/api/tshirts'),
    get('/api/records', isAdmin ? { isAdmin: true } : { userId: user.id }),
    isAdmin ? get('/api/users') : [],
    isAdmin ? get('/api/bills') : []
  ]);
  return { workouts, tshirts, records, users, bills };
});

// Create (no id) or update (with id) an item of any collection: users | workouts | tshirts | records
export const saveItem = createAsyncThunk('fitness/saveItem', async ({ type, id, data }, { rejectWithValue }) => {
  try {
    const res = id ? await axios.put(`/api/${type}/${id}`, data) : await axios.post(`/api/${type}`, data);
    return { type, id, item: res.data };
  } catch (err) {
    return rejectWithValue(errorMessage(err));
  }
});

export const deleteItem = createAsyncThunk('fitness/deleteItem', async ({ type, id }, { rejectWithValue }) => {
  try {
    await axios.delete(`/api/${type}/${id}`);
    return { type, id };
  } catch (err) {
    return rejectWithValue(errorMessage(err));
  }
});

const initialState = {
  workoutCategory: 'all',
  users: [],
  bills: [],
  workouts: [],
  tshirts: [],
  records: [],
  toasts: []
};

const FitnessSlice = createSlice({
  name: 'fitness',
  initialState,
  reducers: {
    setWorkoutCategory: (state, action) => { state.workoutCategory = action.payload; },
    addToast: (state, action) => { state.toasts.push({ id: `${Date.now()}${Math.random()}`, message: action.payload }); },
    removeToast: (state, action) => { state.toasts = state.toasts.filter((t) => t.id !== action.payload); }
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout, () => initialState)
      .addCase(fetchAll.fulfilled, (state, action) => ({ ...state, ...action.payload }))
      .addCase(fetchAll.rejected, (state, action) => {
        state.toasts.push({ id: `${Date.now()}`, message: `Could not load data: ${action.error.message}` });
      })
      .addCase(saveItem.fulfilled, (state, action) => {
        const { type, id, item } = action.payload;
        if (id) state[type] = state[type].map((x) => (x.id === id ? item : x));
        else state[type].unshift(item);
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        const { type, id } = action.payload;
        state[type] = state[type].filter((x) => x.id !== id);
      });
  }
});

export const { setWorkoutCategory, addToast, removeToast } = FitnessSlice.actions;

export default FitnessSlice.reducer;
