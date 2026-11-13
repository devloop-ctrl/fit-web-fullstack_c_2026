import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiLogin, apiRegister } from '../services/api';

const savedUser = (() => {
  try {
    const raw = localStorage.getItem('fp_current_session_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

export const login = createAsyncThunk('user/login', async (credentials, { rejectWithValue }) => {
  try {
    const data = await apiLogin(credentials);
    if (data.success && data.user) {
      localStorage.setItem('fp_current_session_user', JSON.stringify(data.user));
      return data;
    }
    return rejectWithValue(data.message || 'Invalid Credentials');
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
  }
});

export const register = createAsyncThunk('user/register', async (userData, { rejectWithValue }) => {
  try {
    const data = await apiRegister(userData);
    if (data.success && data.user) {
      localStorage.setItem('fp_current_session_user', JSON.stringify(data.user));
      return data;
    }
    return rejectWithValue(data.message || 'Registration failed');
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Registration failed');
  }
});

const initialState = {
  user: savedUser,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
};

export const UserSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      if (action.payload) {
        localStorage.setItem('fp_current_session_user', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('fp_current_session_user');
      }
    },
    logout: (state) => {
      state.user = null;
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      localStorage.removeItem('fp_current_session_user');
    },
    resetStatus: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.message = action.payload.message || 'Login successful';
        state.isSuccess = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.message = action.payload.message || 'Registered successfully';
        state.isSuccess = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Registration failed';
      });
  }
});

export const { setUser, logout, resetStatus } = UserSlice.actions;
export default UserSlice.reducer;
