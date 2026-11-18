import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const STORAGE_KEY = 'fp_current_session_user';
const errorMessage = (err) => err.response?.data?.message || err.message;

// POST credentials -> server verifies against the database -> returns the public user profile
export const login = createAsyncThunk('user/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await axios.post('/api/auth/login', credentials);
    return data.user;
  } catch (err) {
    return rejectWithValue(errorMessage(err));
  }
});

export const register = createAsyncThunk('user/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await axios.post('/api/auth/register', userData);
    return data.user;
  } catch (err) {
    return rejectWithValue(errorMessage(err));
  }
});

export const resetPassword = createAsyncThunk('user/resetPassword', async (email, { rejectWithValue }) => {
  try {
    const { data } = await axios.post('/api/auth/reset-password', { email });
    return data.message;
  } catch (err) {
    return rejectWithValue(errorMessage(err));
  }
});

const pending = (state) => { state.isLoading = true; };
const failed = (state) => { state.isLoading = false; };
const signIn = (state, action) => {
  state.isLoading = false;
  state.user = action.payload;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
};

const UserSlice = createSlice({
  name: 'user',
  initialState: {
    user: JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'),
    isLoading: false
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem(STORAGE_KEY);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, signIn)
      .addCase(login.rejected, failed)
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, signIn)
      .addCase(register.rejected, failed);
  }
});

export const { logout } = UserSlice.actions;
export default UserSlice.reducer;
