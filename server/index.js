// ============================================================
// FitPulse server (Node + Express + MongoDB)
// Read from top to bottom: Imports -> Setup -> Routes -> Start
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
// 2. Setup
// ------------------------------------------------------------

// Reliable DNS for mongodb+srv:// addresses
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Settings come from server/.env (no secrets inside the code)
const PORT = process.env.PORT || 3003;
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is missing. Copy server/.env.example to server/.env and set it.');
}

// Connect to the database, then add starter data if it is empty
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('Database connected');
    await seedDatabase();
  })
  .catch((err) => console.error('Database connection error:', err.message));

const app = express();
app.use(cors());
app.use(express.json());

// Small helpers
const newId = (prefix) => `${prefix}-${Date.now().toString().slice(-6)}`;

const exactText = (text) => new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

const calcBmi = (height, weight) => Number((weight / ((height / 100) * (height / 100))).toFixed(1));

// ------------------------------------------------------------
// 3. Routes
// ------------------------------------------------------------

// ---------------- Auth ----------------

// Login: find the user by username or email, then check the password
app.post('/api/auth/login', async (req, res) => {
  try {
    const username = (req.body.username || '').trim();
    const password = req.body.password || '';

    if (!username || !password) {
      return res.status(400).json({ message: 'Username or email and password are required' });
    }

    const user = await User.findOne({ $or: [{ username: exactText(username) }, { email: exactText(username) }] });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    if (!passwordIsCorrect) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Send the user without the password
    const { id, name, email, phone, role } = user;
    res.json({ user: { id, username: user.username, name, email, phone, role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register: create a new member with a hashed password
app.post('/api/auth/register', async (req, res) => {
  try {
    const username = (req.body.username || '').trim();
    const email = (req.body.email || '').trim();
    const phone = (req.body.phone || '').trim();
    const password = req.body.password || '';

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }
    if (password.length < 4) {
      return res.status(400).json({ message: 'Password must be at least 4 characters long' });
    }

    const exists = await User.findOne({ $or: [{ username: exactText(username) }, { email: exactText(email) }] });
    if (exists) {
      return res.status(400).json({ message: 'Username or email is already registered' });
    }

    const user = await User.create({
      id: newId('U'),
      username,
      name: username,
      email,
      phone,
      role: 'Member',
      password: await bcrypt.hash(password, 10)
    });

    res.status(201).json({
      user: { id: user.id, username, name: user.name, email, phone, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reset password (shows a message only)
app.post('/api/auth/reset-password', (req, res) => {
  res.json({ message: `If ${req.body.email} is registered, reset instructions have been sent.` });
});

// Change password (logged-in user updates their own password)
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    if (newPassword.length < 4) {
      return res.status(400).json({ message: 'New password must be at least 4 characters long' });
    }

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passwordIsCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!passwordIsCorrect) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------- Users (Create & Read) ----------------

// READ all
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE
app.post('/api/users', async (req, res) => {
  try {
    const { username, name, email, phone, role, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
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

    res.status(201).json({ id: user.id, username, name: user.name, email, phone, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------- Bills (created at checkout; admin reads all, member reads own) ----------------

// READ all, or only one member's bills with ?email=...
app.get('/api/bills', async (req, res) => {
  try {
    const filter = req.query.email ? { email: exactText(req.query.email.trim()) } : {};
    res.json(await Bill.find(filter).sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE
app.post('/api/bills', async (req, res) => {
  try {
    const { customerName, email, items, total, status } = req.body;
    const bill = await Bill.create({ id: newId('INV'), customerName, email, items, total, status });
    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------- Workouts (CRUD) ----------------

// READ all
app.get('/api/workouts', async (req, res) => {
  try {
    res.json(await Workout.find().sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE
app.post('/api/workouts', async (req, res) => {
  try {
    const { title, category, difficulty, duration, exercises } = req.body;
    const workout = await Workout.create({ id: newId('W'), title, category, difficulty, duration, exercises });
    res.status(201).json(workout);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE
app.put('/api/workouts/:id', async (req, res) => {
  try {
    const { title, category, difficulty, duration, exercises } = req.body;
    const workout = await Workout.findOneAndUpdate(
      { id: req.params.id },
      { title, category, difficulty, duration, exercises },
      { new: true }
    );

    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    res.json(workout);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE
app.delete('/api/workouts/:id', async (req, res) => {
  try {
    await Workout.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Workout deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------- T-shirts (CRUD) ----------------

// READ all
app.get('/api/tshirts', async (req, res) => {
  try {
    res.json(await Tshirt.find().sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE
app.post('/api/tshirts', async (req, res) => {
  try {
    const { title, price, stock, color, image, desc } = req.body;
    const tshirt = await Tshirt.create({
      id: newId('TS'),
      title,
      price: Number(price),
      stock: Number(stock),
      color,
      image,
      desc
    });
    res.status(201).json(tshirt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE
app.put('/api/tshirts/:id', async (req, res) => {
  try {
    const { title, price, stock, color, image, desc } = req.body;
    const tshirt = await Tshirt.findOneAndUpdate(
      { id: req.params.id },
      { title, price: Number(price), stock: Number(stock), color, image, desc },
      { new: true }
    );

    if (!tshirt) return res.status(404).json({ message: 'T-shirt not found' });
    res.json(tshirt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE
app.delete('/api/tshirts/:id', async (req, res) => {
  try {
    await Tshirt.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'T-shirt deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------- Records (Create, Read, Member Delete) ----------------

// READ: all records, or only one member's records with ?userId=...
app.get('/api/records', async (req, res) => {
  try {
    const filter = req.query.userId ? { userId: req.query.userId } : {};
    res.json(await Record.find(filter).sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE (the BMI is calculated here from height and weight)
app.post('/api/records', async (req, res) => {
  try {
    const { userId, userEmail, name, height, weight, calories, steps } = req.body;
    const h = Number(height);
    const w = Number(weight);

    if (!userId || h <= 0 || w <= 0) {
      return res.status(400).json({ message: 'User ID, valid height, and valid weight are required' });
    }

    const record = await Record.create({
      id: newId('R'),
      userId,
      userEmail,
      name,
      height: h,
      weight: w,
      bmi: calcBmi(h, w),
      calories: Number(calories),
      steps: Number(steps)
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE (used by members on their own records)
app.delete('/api/records/:id', async (req, res) => {
  try {
    await Record.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ------------------------------------------------------------
// 4. Start the server
// ------------------------------------------------------------
app.listen(PORT, () => console.log(`FitPulse server running on port ${PORT}`));
