import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Authentication APIs
export const apiLogin = async (credentials) => {
  const res = await api.post('/api/auth/login', credentials);
  return res.data;
};

export const apiRegister = async (userData) => {
  const res = await api.post('/api/auth/register', userData);
  return res.data;
};

export const apiResetPassword = async (email) => {
  const res = await api.post('/api/auth/reset-password', { email });
  return res.data;
};

// Users CRUD APIs
export const apiGetUsers = async () => {
  const res = await api.get('/api/users');
  return res.data;
};

export const apiCreateUser = async (user) => {
  const res = await api.post('/api/users', user);
  return res.data;
};

export const apiUpdateUser = async (id, user) => {
  const res = await api.put(`/api/users/${id}`, user);
  return res.data;
};

export const apiDeleteUser = async (id) => {
  const res = await api.delete(`/api/users/${id}`);
  return res.data;
};

// Bills / Invoices CRUD APIs
export const apiGetBills = async () => {
  const res = await api.get('/api/bills');
  return res.data;
};

export const apiCreateBill = async (bill) => {
  const res = await api.post('/api/bills', bill);
  return res.data;
};

export const apiUpdateBill = async (id, bill) => {
  const res = await api.put(`/api/bills/${id}`, bill);
  return res.data;
};

export const apiToggleBillStatus = async (id) => {
  const res = await api.patch(`/api/bills/${id}/toggle-status`);
  return res.data;
};

export const apiDeleteBill = async (id) => {
  const res = await api.delete(`/api/bills/${id}`);
  return res.data;
};

// Workouts CRUD APIs
export const apiGetWorkouts = async (category = 'all') => {
  const res = await api.get(`/api/workouts${category !== 'all' ? `?category=${encodeURIComponent(category)}` : ''}`);
  return res.data;
};

export const apiCreateWorkout = async (workout) => {
  const res = await api.post('/api/workouts', workout);
  return res.data;
};

export const apiUpdateWorkout = async (id, workout) => {
  const res = await api.put(`/api/workouts/${id}`, workout);
  return res.data;
};

export const apiDeleteWorkout = async (id) => {
  const res = await api.delete(`/api/workouts/${id}`);
  return res.data;
};

// T-Shirts CRUD APIs
export const apiGetTshirts = async () => {
  const res = await api.get('/api/tshirts');
  return res.data;
};

export const apiCreateTshirt = async (shirt) => {
  const res = await api.post('/api/tshirts', shirt);
  return res.data;
};

export const apiUpdateTshirt = async (id, shirt) => {
  const res = await api.put(`/api/tshirts/${id}`, shirt);
  return res.data;
};

export const apiDeleteTshirt = async (id) => {
  const res = await api.delete(`/api/tshirts/${id}`);
  return res.data;
};

// Records CRUD APIs
export const apiGetRecords = async () => {
  const res = await api.get('/api/records');
  return res.data;
};

export const apiCreateRecord = async (record) => {
  const res = await api.post('/api/records', record);
  return res.data;
};

export const apiUpdateRecord = async (id, record) => {
  const res = await api.put(`/api/records/${id}`, record);
  return res.data;
};

export const apiDeleteRecord = async (id) => {
  const res = await api.delete(`/api/records/${id}`);
  return res.data;
};

export default api;

