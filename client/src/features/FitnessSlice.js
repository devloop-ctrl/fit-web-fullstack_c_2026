// ============================================================
// FitnessSlice: data from the database (CRUD) + toast messages
// CRUD = Create (addItem), Read (fetchData), Update (updateItem), Delete (deleteItem)
// "type" is the collection name: users | workouts | tshirts | records
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { logout } from './UserSlice';

// ------------------------------------------------------------
// 2. Helper
// ------------------------------------------------------------

// Get the message the server sent, or the normal error message
const getMessage = (err) => err.response?.data?.message || err.message;

// ------------------------------------------------------------
// 3. Async thunks (talk to the server)
// ------------------------------------------------------------

// READ: load all the data the signed-in user needs
export const fetchData = createAsyncThunk('fitness/fetchData', async (user, { rejectWithValue }) => {
  try {
    const data = { workouts: [], tshirts: [], records: [], users: [], bills: [] };

    // Everyone gets workouts and t-shirts
    data.workouts = (await axios.get('/api/workouts')).data;
    data.tshirts = (await axios.get('/api/tshirts')).data;

    if (user.role === 'Admin') {
      // Admin gets everything
      data.records = (await axios.get('/api/records')).data;
      data.users = (await axios.get('/api/users')).data;
      data.bills = (await axios.get('/api/bills')).data;
    } else {
      // Member gets only his own records
      data.records = (await axios.get(`/api/records?userId=${user.id}`)).data;
    }

    return data;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

// CREATE
export const addItem = createAsyncThunk('fitness/addItem', async ({ type, data }, { rejectWithValue }) => {
  try {
    const res = await axios.post(`/api/${type}`, data);
    return { type, item: res.data };
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

// UPDATE
export const updateItem = createAsyncThunk('fitness/updateItem', async ({ type, id, data }, { rejectWithValue }) => {
  try {
    const res = await axios.put(`/api/${type}/${id}`, data);
    return { type, item: res.data };
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

// DELETE
export const deleteItem = createAsyncThunk('fitness/deleteItem', async ({ type, id }, { rejectWithValue }) => {
  try {
    await axios.delete(`/api/${type}/${id}`);
    return { type, id };
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

// ------------------------------------------------------------
// 4. Slice (state + reducers)
// ------------------------------------------------------------
const initialState = {
  users: [],
  bills: [],
  workouts: [],
  tshirts: [],
  records: [],
  workoutCategory: 'all',
  toasts: []
};

const FitnessSlice = createSlice({
  name: 'fitness',
  initialState,

  // Normal actions
  reducers: {
    setWorkoutCategory: (state, action) => {
      state.workoutCategory = action.payload;
    },
    addToast: (state, action) => {
      state.toasts.push({ id: Date.now() + Math.random(), message: action.payload });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    }
  },

  // Actions from the thunks above
  extraReducers: (builder) => {
    builder
      // On logout: clear everything
      .addCase(logout, () => initialState)

      // READ done: put the data in the state
      .addCase(fetchData.fulfilled, (state, action) => {
        state.workouts = action.payload.workouts;
        state.tshirts = action.payload.tshirts;
        state.records = action.payload.records;
        state.users = action.payload.users;
        state.bills = action.payload.bills;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.toasts.push({ id: Date.now(), message: `Could not load data: ${action.payload}` });
      })

      // CREATE done: add the new item at the top of the list
      .addCase(addItem.fulfilled, (state, action) => {
        const { type, item } = action.payload;
        state[type].unshift(item);
      })

      // UPDATE done: replace the old item with the new one
      .addCase(updateItem.fulfilled, (state, action) => {
        const { type, item } = action.payload;
        const index = state[type].findIndex((x) => x.id === item?.id);
        if (index !== -1) state[type][index] = item;
      })

      // DELETE done: remove the item from the list
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
