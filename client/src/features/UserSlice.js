// ============================================================
// UserSlice: the signed-in user (login, register, reset password, logout)
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ------------------------------------------------------------
// 2. Async thunks (talk to the server)
// ------------------------------------------------------------

// Get the message the server sent, or the normal error message
const getMessage = (err) => err.response?.data?.message || err.message;

// Login
export const login = createAsyncThunk('user/login', async (credentials, { rejectWithValue }) => {
  try {
    const res = await axios.post('/api/auth/login', credentials);
    return res.data.user;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

// Register
export const register = createAsyncThunk('user/register', async (userData, { rejectWithValue }) => {
  try {
    const res = await axios.post('/api/auth/register', userData);
    return res.data.user;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

// Reset password
export const resetPassword = createAsyncThunk('user/resetPassword', async (email, { rejectWithValue }) => {
  try {
    const res = await axios.post('/api/auth/reset-password', { email });
    return res.data.message;
  } catch (err) {
    return rejectWithValue(getMessage(err));
  }
});

// ------------------------------------------------------------
// 3. Slice (state + reducers)
// ------------------------------------------------------------

// Save the user in the browser so he stays signed in after refresh
const saveUser = (state, action) => {
  state.isLoading = false;
  state.user = action.payload;
  localStorage.setItem('fp_current_session_user', JSON.stringify(action.payload));
};

const UserSlice = createSlice({
  name: 'user',
  initialState: {
    user: JSON.parse(localStorage.getItem('fp_current_session_user') || 'null'),
    isLoading: false
  },

  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('fp_current_session_user');
    }
  },

  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => { state.isLoading = true; })
      .addCase(login.fulfilled, saveUser)
      .addCase(login.rejected, (state) => { state.isLoading = false; })

      // Register
      .addCase(register.pending, (state) => { state.isLoading = true; })
      .addCase(register.fulfilled, saveUser)
      .addCase(register.rejected, (state) => { state.isLoading = false; })

      // Reset password
      .addCase(resetPassword.pending, (state) => { state.isLoading = true; })
      .addCase(resetPassword.fulfilled, (state) => { state.isLoading = false; })
      .addCase(resetPassword.rejected, (state) => { state.isLoading = false; });
  }
});

// ------------------------------------------------------------
// 4. Exports
// ------------------------------------------------------------
export const { logout } = UserSlice.actions;
export default UserSlice.reducer;
