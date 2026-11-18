// ============================================================
// FitPulse server (Express + MongoDB)
// The file is read from top to bottom:
//   1. Imports  2. Setup  3. Helpers  4. Routes  5. Start server
// ============================================================

// ------------------------------------------------------------
// 1. Imports
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// 2. Setup: environment, database connection, and Express app
// ------------------------------------------------------------

// Reliable DNS lookups for mongodb+srv:// addresses
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Settings come from server/.env (never write secrets inside the code)
const { PORT = 3003, MONGODB_URI } = process.env;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is missing. Copy server/.env.example to server/.env and set it.');
}

// Connect to the database, then add starter data if the database is empty
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('Database connected');
    await seedDatabase();
  })
  .catch((err) => console.error('Database connection error:', err.message));

// Create the app
const app = express();
app.use(cors());
app.use(express.json());

// ------------------------------------------------------------
// 3. Helper functions
// ------------------------------------------------------------

// Wrap a route so any error becomes a clean 500 response
const route = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Make a new id like "U-123456"
const newId = (prefix) => `${prefix}-${Date.now().toString().slice(-6)}`;

// Build a case-insensitive "exactly equals" search pattern
const exactMatch = (value) => new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

// The user fields that are safe to send to the browser (no password)
const publicUser = ({ id, username, name, email, phone, role }) => ({ id, username, name, email, phone, role });

// Add the BMI to a record using its height and weight
const withBmi = (data) => ({ ...data, bmi: +(data.weight / (data.height / 100) ** 2).toFixed(1) });

// Create the 4 standard routes (list, create, update, delete) for a model
const addCrudRoutes = (path, Model, idPrefix) => {
  // List all
  app.get(path, route(async (req, res) => {
    res.json(await Model.find().sort({ createdAt: -1 }));
  }));

  // Create
  app.post(path, route(async (req, res) => {
    res.status(201).json(await Model.create({ ...req.body, id: newId(idPrefix) }));
  }));

  // Update
  app.put(`${path}/:id`, route(async (req, res) => {
    res.json(await Model.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, runValidators: true }));
  }));

  // Delete
  app.delete(`${path}/:id`, route(async (req, res) => {
    await Model.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Deleted' });
  }));
};

// ------------------------------------------------------------
// 4. Routes
// ------------------------------------------------------------

// ---------------- 4.1 Auth ----------------

// POST /api/auth/login
app.post('/api/auth/login', route(async (req, res) => {
  const { username = '', password } = req.body;

  // Step 1: both fields are required
  if (!username.trim() || !password) {
    return res.status(400).json({ message: 'Username or email and password are required' });
  }

  // Step 2: find the user by username or email
  const user = await User.findOne({
    $or: [{ username: exactMatch(username.trim()) }, { email: exactMatch(username.trim()) }]
  });

  // Step 3: check the password (stored as a bcrypt hash)
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Step 4: send the user back (without the password)
  res.json({ user: publicUser(user) });
}));

// POST /api/auth/register
app.post('/api/auth/register', route(async (req, res) => {
  const { username = '', email = '', phone = '', password = '' } = req.body;

  // Step 1: check the input
  if (!username.trim() || !email.trim() || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }
  if (password.length < 4) {
    return res.status(400).json({ message: 'Password must be at least 4 characters long' });
  }

  // Step 2: username and email must not be used already
  if (await User.exists({ username: exactMatch(username.trim()) })) {
    return res.status(400).json({ message: 'Username is already taken' });
  }
  if (await User.exists({ email: exactMatch(email.trim()) })) {
    return res.status(400).json({ message: 'Email is already registered' });
  }

  // Step 3: save the new member with a hashed password
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

// POST /api/auth/reset-password
app.post('/api/auth/reset-password', route(async (req, res) => {
  res.json({ message: `If ${req.body.email} is registered, reset instructions have been sent.` });
}));

// ---------------- 4.2 Users (admin) ----------------

// GET /api/users
app.get('/api/users', route(async (req, res) => {
  res.json(await User.find().select('-password').sort({ createdAt: -1 }));
}));

// POST /api/users
app.post('/api/users', route(async (req, res) => {
  const { username, name, email, phone, role, password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  const user = await User.create({
    id: newId('U'),
    username,
    name: name || username,
    email,
    phone,
    role,
    password: await bcrypt.hash(password, 10)
  });

  res.status(201).json(publicUser(user));
}));

// PUT /api/users/:id
app.put('/api/users/:id', route(async (req, res) => {
  const { username, name, email, phone, role } = req.body;

  const user = await User.findOneAndUpdate(
    { id: req.params.id },
    { username, name, email, phone, role },
    { new: true }
  ).select('-password');

  res.json(user);
}));

// DELETE /api/users/:id
app.delete('/api/users/:id', route(async (req, res) => {
  await User.findOneAndDelete({ id: req.params.id });
  res.json({ message: 'User deleted' });
}));

// ---------------- 4.3 Bills (created at checkout, read-only for admin) ----------------

// GET /api/bills
app.get('/api/bills', route(async (req, res) => {
  res.json(await Bill.find().sort({ createdAt: -1 }));
}));

// POST /api/bills
app.post('/api/bills', route(async (req, res) => {
  const { customerName, email, items, total, status } = req.body;
  res.status(201).json(await Bill.create({ id: newId('INV'), customerName, email, items, total, status }));
}));

// ---------------- 4.4 Workouts and T-shirts (simple CRUD) ----------------
addCrudRoutes('/api/workouts', Workout, 'W');
addCrudRoutes('/api/tshirts', Tshirt, 'TS');

// ---------------- 4.5 Records (a member sees only theirs, admin sees all) ----------------

// GET /api/records?userId=...  or  /api/records?isAdmin=true
app.get('/api/records', route(async (req, res) => {
  const { userId, isAdmin } = req.query;

  // No user and not admin: return nothing
  if (isAdmin !== 'true' && !userId) {
    return res.json([]);
  }

  const filter = isAdmin === 'true' ? {} : { userId };
  res.json(await Record.find(filter).sort({ createdAt: -1 }));
}));

// POST /api/records
app.post('/api/records', route(async (req, res) => {
  if (!req.body.userId) {
    return res.status(400).json({ message: 'Please log in to save your health records.' });
  }
  res.status(201).json(await Record.create(withBmi({ ...req.body, id: newId('R') })));
}));

// PUT /api/records/:id
app.put('/api/records/:id', route(async (req, res) => {
  res.json(await Record.findOneAndUpdate({ id: req.params.id }, withBmi(req.body), { new: true, runValidators: true }));
}));

// DELETE /api/records/:id
app.delete('/api/records/:id', route(async (req, res) => {
  await Record.findOneAndDelete({ id: req.params.id });
  res.json({ message: 'Record deleted' });
}));

// ------------------------------------------------------------
// 5. Start the server
// ------------------------------------------------------------
app.listen(PORT, () => console.log(`FitPulse server running on port ${PORT}`));
