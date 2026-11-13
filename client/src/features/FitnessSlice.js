import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  apiGetUsers, apiCreateUser, apiUpdateUser, apiDeleteUser,
  apiGetBills, apiCreateBill, apiUpdateBill, apiToggleBillStatus, apiDeleteBill,
  apiGetWorkouts, apiCreateWorkout, apiUpdateWorkout, apiDeleteWorkout,
  apiGetTshirts, apiCreateTshirt, apiUpdateTshirt, apiDeleteTshirt,
  apiGetRecords, apiCreateRecord, apiUpdateRecord, apiDeleteRecord
} from '../services/api';

// Async thunks for fetching data
export const fetchAllFitnessData = createAsyncThunk('fitness/fetchAll', async (authContext = {}) => {
  const isAdmin = authContext?.role === 'Admin';
  const userId = authContext?.id;

  const [users, bills, workouts, tshirts, records] = await Promise.all([
    isAdmin ? apiGetUsers().catch(() => []) : Promise.resolve([]),
    isAdmin ? apiGetBills().catch(() => []) : Promise.resolve([]),
    apiGetWorkouts().catch(() => []),
    apiGetTshirts().catch(() => []),
    apiGetRecords({ userId, isAdmin }).catch(() => [])
  ]);
  return { users, bills, workouts, tshirts, records };
});

export const fetchWorkouts = createAsyncThunk('fitness/fetchWorkouts', async (category = 'all') => {
  return await apiGetWorkouts(category);
});

export const fetchTshirts = createAsyncThunk('fitness/fetchTshirts', async () => {
  return await apiGetTshirts();
});

export const fetchRecords = createAsyncThunk('fitness/fetchRecords', async (params = {}) => {
  return await apiGetRecords(params);
});

export const fetchBills = createAsyncThunk('fitness/fetchBills', async () => {
  return await apiGetBills();
});

export const fetchUsers = createAsyncThunk('fitness/fetchUsers', async () => {
  return await apiGetUsers();
});

// Async thunks for mutations
export const saveMeasurementRecord = createAsyncThunk('fitness/saveRecord', async (recordData) => {
  return await apiCreateRecord(recordData);
});

export const toggleInvoiceStatus = createAsyncThunk('fitness/toggleBillStatus', async (id) => {
  return await apiToggleBillStatus(id);
});

export const deleteFitnessItem = createAsyncThunk('fitness/deleteItem', async ({ type, id }) => {
  if (type === 'bills') await apiDeleteBill(id);
  else if (type === 'users') await apiDeleteUser(id);
  else if (type === 'workouts') await apiDeleteWorkout(id);
  else if (type === 'tshirts') await apiDeleteTshirt(id);
  else if (type === 'records') await apiDeleteRecord(id);
  return { type, id };
});

export const saveCrudModalItem = createAsyncThunk('fitness/saveCrudModalItem', async ({ type, editId, data }) => {
  let result;
  if (type === 'bills') {
    result = editId ? await apiUpdateBill(editId, data) : await apiCreateBill(data);
  } else if (type === 'users') {
    result = editId ? await apiUpdateUser(editId, data) : await apiCreateUser(data);
  } else if (type === 'workouts') {
    result = editId ? await apiUpdateWorkout(editId, data) : await apiCreateWorkout(data);
  } else if (type === 'tshirts') {
    result = editId ? await apiUpdateTshirt(editId, data) : await apiCreateTshirt(data);
  } else if (type === 'records') {
    result = editId ? await apiUpdateRecord(editId, data) : await apiCreateRecord(data);
  }
  return { type, editId, item: result };
});

const initialState = {
  activePage: 'calculators',
  mode: 'user', // 'user' | 'admin'
  adminTab: 'bills', // 'bills' | 'users' | 'workouts' | 'tshirts' | 'records'
  workoutCategory: 'all',
  
  // Data lists
  users: [],
  bills: [],
  workouts: [],
  tshirts: [],
  records: [],

  // Loading and error states
  loading: false,
  error: null,

  // UI Modals
  authModal: {
    isOpen: false,
    view: 'login' // 'login' | 'register' | 'reset'
  },
  crudModal: {
    isOpen: false,
    type: '', // 'bills' | 'users' | 'workouts' | 'tshirts' | 'records'
    item: null
  },

  // Active toast list
  toasts: []
};

export const FitnessSlice = createSlice({
  name: 'fitness',
  initialState,
  reducers: {
    setActivePage: (state, action) => {
      state.activePage = action.payload;
      if (state.mode === 'admin') {
        state.mode = 'user';
      }
    },
    toggleMode: (state, action) => {
      const role = action.payload?.role;
      if (role !== 'Admin') {
        state.mode = 'user';
        return;
      }
      state.mode = state.mode === 'user' ? 'admin' : 'user';
    },
    setMode: (state, action) => {
      state.mode = action.payload;
    },
    clearUserRecords: (state) => {
      state.records = [];
      state.mode = 'user';
      state.users = [];
      state.bills = [];
    },
    setAdminTab: (state, action) => {
      state.adminTab = action.payload;
    },
    setWorkoutCategory: (state, action) => {
      state.workoutCategory = action.payload;
    },
    openAuthModal: (state, action) => {
      state.authModal.isOpen = true;
      state.authModal.view = action.payload || 'login';
    },
    closeAuthModal: (state) => {
      state.authModal.isOpen = false;
    },
    switchAuthView: (state, action) => {
      state.authModal.view = action.payload;
    },
    openCrudModal: (state, action) => {
      const { type, item } = action.payload;
      state.crudModal.isOpen = true;
      state.crudModal.type = type;
      state.crudModal.item = item || null;
    },
    closeCrudModal: (state) => {
      state.crudModal.isOpen = false;
      state.crudModal.type = '';
      state.crudModal.item = null;
    },
    addToast: (state, action) => {
      const id = Date.now().toString() + Math.random().toString().slice(2, 5);
      state.toasts.push({ id, message: action.payload });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchAllFitnessData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllFitnessData.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.bills = action.payload.bills;
        state.workouts = action.payload.workouts;
        state.tshirts = action.payload.tshirts;
        state.records = action.payload.records;
      })
      .addCase(fetchAllFitnessData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Fetch Workouts
      .addCase(fetchWorkouts.fulfilled, (state, action) => {
        state.workouts = action.payload;
      })

      // Fetch T-Shirts
      .addCase(fetchTshirts.fulfilled, (state, action) => {
        state.tshirts = action.payload;
      })

      // Fetch Records
      .addCase(fetchRecords.fulfilled, (state, action) => {
        state.records = action.payload;
      })

      // Fetch Bills
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.bills = action.payload;
      })

      // Fetch Users
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })

      // Save Record
      .addCase(saveMeasurementRecord.fulfilled, (state, action) => {
        state.records.unshift(action.payload);
      })

      // Toggle bill status
      .addCase(toggleInvoiceStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.bills.findIndex(b => b.id === updated.id);
        if (index !== -1) {
          state.bills[index] = updated;
        }
      })

      // Delete item
      .addCase(deleteFitnessItem.fulfilled, (state, action) => {
        const { type, id } = action.payload;
        if (type === 'bills') state.bills = state.bills.filter(x => x.id !== id);
        else if (type === 'users') state.users = state.users.filter(x => x.id !== id);
        else if (type === 'workouts') state.workouts = state.workouts.filter(x => x.id !== id);
        else if (type === 'tshirts') state.tshirts = state.tshirts.filter(x => x.id !== id);
        else if (type === 'records') state.records = state.records.filter(x => x.id !== id);
      })

      // Save Crud item
      .addCase(saveCrudModalItem.fulfilled, (state, action) => {
        const { type, editId, item } = action.payload;
        const listName = type;
        if (state[listName]) {
          if (editId) {
            const idx = state[listName].findIndex(x => x.id === editId);
            if (idx !== -1) {
              state[listName][idx] = item;
            }
          } else {
            state[listName].unshift(item);
          }
        }
      });
  }
});

export const {
  setActivePage,
  toggleMode,
  setMode,
  clearUserRecords,
  setAdminTab,
  setWorkoutCategory,
  openAuthModal,
  closeAuthModal,
  switchAuthView,
  openCrudModal,
  closeCrudModal,
  addToast,
  removeToast
} = FitnessSlice.actions;

export default FitnessSlice.reducer;

