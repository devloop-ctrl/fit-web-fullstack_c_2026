// ============================================================
// UserSlice: everything about the signed-in user (login, register, logout)
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ------------------------------------------------------------
// 2. Constants and small helpers
// ------------------------------------------------------------

// The key used to remember the user in the browser after refresh
const STORAGE_KEY = 'fp_current_session_user';

// Get a readable error message from a failed request
const getErrorMessage = (err) => err.response?.data?.message || err.message;

// ------------------------------------------------------------
// 3. Async thunks (talk to the server)
// ------------------------------------------------------------

// Login: send username + password, the server checks the database
export const login = createAsyncThunk('user/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await axios.post('/api/auth/login', credentials);
    return data.user;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

// Register: create a new member account in the database
export const register = createAsyncThunk('user/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await axios.post('/api/auth/register', userData);
    return data.user;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

// Reset password: ask the server to send recovery instructions
export const resetPassword = createAsyncThunk('user/resetPassword', async (email, { rejectWithValue }) => {
  try {
    const { data } = await axios.post('/api/auth/reset-password', { email });
    return data.message;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

// ------------------------------------------------------------
// 4. Reducer helpers (shared by login and register)
// ------------------------------------------------------------

// While the request is running
const onPending = (state) => {
  state.isLoading = true;
};

// When the request ends without signing in (failed, or nothing to save)
const onStopLoading = (state) => {
  state.isLoading = false;
};

// When login or register succeeds: save the user in state and in the browser
const onSignedIn = (state, action) => {
  state.isLoading = false;
  state.user = action.payload;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
};

// ------------------------------------------------------------
// 5. Slice (state + reducers)
// ------------------------------------------------------------
const UserSlice = createSlice({
  name: 'user',

  // Start with the user saved in the browser (or null)
  initialState: {
    user: JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'),
    isLoading: false
  },

  // Normal (instant) actions
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  // Actions that come from the async thunks above
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, onPending)
      .addCase(login.fulfilled, onSignedIn)
      .addCase(login.rejected, onStopLoading)
      .addCase(register.pending, onPending)
      .addCase(register.fulfilled, onSignedIn)
      .addCase(register.rejected, onStopLoading)
      .addCase(resetPassword.pending, onPending)
      .addCase(resetPassword.fulfilled, onStopLoading) // just stop the loading spinner
      .addCase(resetPassword.rejected, onStopLoading);
  }
});

// ------------------------------------------------------------
// 6. Exports
// ------------------------------------------------------------
export const { logout } = UserSlice.actions;
export default UserSlice.reducer;
