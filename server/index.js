import dns from 'node:dns';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import 'dotenv/config';

import User from './models/User.js';
import Bill from './models/Bill.js';
import Workout from './models/Workout.js';
import Tshirt from './models/Tshirt.js';
import Record from './models/Record.js';
import { seedDatabase } from './seedData.js';

dns.setServers(['8.8.8.8', '8.8.4.4']); // reliable SRV lookups for mongodb+srv URIs

const { PORT = 3003, MONGODB_URI } = process.env;
if (!MONGODB_URI) throw new Error('MONGODB_URI is missing. Copy server/.env.example to server/.env and set it.');

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Database connected');
    await seedDatabase();
  })
  .catch((err) => console.error('Database connection error:', err.message));

const app = express();
app.use(cors());
app.use(express.json());

// Helpers
const route = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const newId = (prefix) => `${prefix}-${Date.now().toString().slice(-6)}`;
const exact = (value) => new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'); // case-insensitive exact match
const publicUser = ({ id, username, name, email, phone, role }) => ({ id, username, name, email, phone, role });

/* ---------------- AUTH ---------------- */
app.post('/api/auth/login', route(async (req, res) => {
  const { username = '', password } = req.body;
  if (!username.trim() || !password) return res.status(400).json({ message: 'Username or email and password are required' });

  const user = await User.findOne({ $or: [{ username: exact(username.trim()) }, { email: exact(username.trim()) }] });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  res.json({ user: publicUser(user) });
}));

app.post('/api/auth/register', route(async (req, res) => {
  const { username = '', email = '', phone = '', password = '' } = req.body;
  if (!username.trim() || !email.trim() || !password) return res.status(400).json({ message: 'Username, email, and password are required' });
  if (password.length < 4) return res.status(400).json({ message: 'Password must be at least 4 characters long' });
  if (await User.exists({ username: exact(username.trim()) })) return res.status(400).json({ message: 'Username is already taken' });
  if (await User.exists({ email: exact(email.trim()) })) return res.status(400).json({ message: 'Email is already registered' });

  const user = await User.create({
    id: newId('U'),
    username: username.trim(),
    name: username.trim(),
    email: email.trim(),
    phone: phone.trim(),
    role: 'Member',
    password: await bcrypt.hash(password, 10)
  });
  res.status(201).json({ user: publicUser(user) });
}));

app.post('/api/auth/reset-password', route(async (req, res) => {
  res.json({ message: `If ${req.body.email} is registered, reset instructions have been sent.` });
}));

/* ---------------- USERS (admin) ---------------- */
app.get('/api/users', route(async (req, res) => {
  res.json(await User.find().select('-password').sort({ createdAt: -1 }));
}));

app.post('/api/users', route(async (req, res) => {
  const { username, name, email, phone, role, password } = req.body;
  if (!password) return res.status(400).json({ message: 'Password is required' });
  const user = await User.create({
    id: newId('U'), username, name: name || username, email, phone, role,
    password: await bcrypt.hash(password, 10)
  });
  res.status(201).json(publicUser(user));
}));

app.put('/api/users/:id', route(async (req, res) => {
  const { username, name, email, phone, role } = req.body;
  res.json(await User.findOneAndUpdate({ id: req.params.id }, { username, name, email, phone, role }, { new: true }).select('-password'));
}));

app.delete('/api/users/:id', route(async (req, res) => {
  await User.findOneAndDelete({ id: req.params.id });
  res.json({ message: 'User deleted' });
}));

/* ---------------- BILLS (created at checkout, read-only for admin) ---------------- */
app.get('/api/bills', route(async (req, res) => {
  res.json(await Bill.find().sort({ createdAt: -1 }));
}));

app.post('/api/bills', route(async (req, res) => {
  const { customerName, email, items, total, status } = req.body;
  res.status(201).json(await Bill.create({ id: newId('INV'), customerName, email, items, total, status }));
}));

/* ---------------- WORKOUTS & T-SHIRTS (simple CRUD) ---------------- */
const crud = (path, Model, prefix) => {
  app.get(path, route(async (req, res) => res.json(await Model.find().sort({ createdAt: -1 }))));
  app.post(path, route(async (req, res) => res.status(201).json(await Model.create({ ...req.body, id: newId(prefix) }))));
  app.put(`${path}/:id`, route(async (req, res) => res.json(await Model.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, runValidators: true }))));
  app.delete(`${path}/:id`, route(async (req, res) => {
    await Model.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Deleted' });
  }));
};
crud('/api/workouts', Workout, 'W');
crud('/api/tshirts', Tshirt, 'TS');

/* ---------------- RECORDS (user-scoped; admin sees all) ---------------- */
const withBmi = (data) => ({ ...data, bmi: +(data.weight / (data.height / 100) ** 2).toFixed(1) });

app.get('/api/records', route(async (req, res) => {
  const { userId, isAdmin } = req.query;
  if (isAdmin !== 'true' && !userId) return res.json([]);
  res.json(await Record.find(isAdmin === 'true' ? {} : { userId }).sort({ createdAt: -1 }));
}));

app.post('/api/records', route(async (req, res) => {
  if (!req.body.userId) return res.status(400).json({ message: 'Please log in to save your health records.' });
  res.status(201).json(await Record.create(withBmi({ ...req.body, id: newId('R') })));
}));

app.put('/api/records/:id', route(async (req, res) => {
  res.json(await Record.findOneAndUpdate({ id: req.params.id }, withBmi(req.body), { new: true, runValidators: true }));
}));

app.delete('/api/records/:id', route(async (req, res) => {
  await Record.findOneAndDelete({ id: req.params.id });
  res.json({ message: 'Record deleted' });
}));

app.listen(PORT, () => console.log(`FitPulse server running on port ${PORT}`));
