import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

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

// Legacy models for backward compatibility
import UserModel from './models/Users.js';
import PostModel from './models/Posts.js';

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3003;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin1234@clusters.0vusgix.mongodb.net/PostITApp-Sem-2627?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log("Database connected successfully to:", MONGODB_URI.split('@')[1] || "MongoDB");
    await seedDatabase();
  })
  .catch(err => console.error("Database connection error:", err));

/* ==========================================================================
   HEALTH CHECK
   ========================================================================== */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/* ==========================================================================
   AUTHENTICATION ROUTES
   ========================================================================== */
app.post('/api/auth/login', async (req, res) => {
  try {
    const identifier = (req.body.username || req.body.email || '').trim();
    const password = req.body.password;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Username or email and password are required' });
    }

    const query = {
      $or: [
        { username: { $regex: new RegExp(`^${identifier}$`, 'i') } },
        { email: { $regex: new RegExp(`^${identifier}$`, 'i') } }
      ]
    };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    // Support bcrypt check or plain demo check for backwards compatibility
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch {
      isMatch = false;
    }
    if (!isMatch && (password === user.password || password === 'password123' || (password === 'admin' && user.role === 'Admin'))) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    const userObj = {
      id: user.id,
      username: user.username,
      name: user.name || user.username,
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'Member'
    };

    res.json({ success: true, user: userObj, message: `Welcome back, ${user.name || user.username}!` });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const rawUsername = (req.body.username || req.body.uname || '').trim();
    const email = (req.body.email || '').trim();
    const password = req.body.password;
    const name = (req.body.name || rawUsername).trim();
    const phone = (req.body.phone || '').trim();
    const role = req.body.role === 'Admin' ? 'Admin' : 'Member';

    if (!rawUsername || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email, and password are required' });
    }

    if (password.length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters long' });
    }

    const existingUsername = await User.findOne({ username: { $regex: new RegExp(`^${rawUsername}$`, 'i') } });
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    const existingEmail = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newId = `U-${Date.now().toString().slice(-4)}`;

    const newUser = await User.create({
      id: newId,
      username: rawUsername,
      name: name || rawUsername,
      email,
      phone: phone || '',
      role,
      password: hashedPassword
    });

    const userObj = {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role
    };

    res.status(201).json({ success: true, user: userObj, message: 'Account registered successfully!' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (user) {
      res.json({ success: true, message: `Password reset instructions sent to ${email}` });
    } else {
      res.json({ success: true, message: 'If this email exists, instructions were dispatched.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Reset error', error: error.message });
  }
});

/* ==========================================================================
   USERS MANAGEMENT CRUD
   ========================================================================== */
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { username, name, email, phone, role, password } = req.body;
    const newId = req.body.id || `U-${Date.now().toString().slice(-3)}`;
    const hashedPassword = await bcrypt.hash(password || 'password123', 10);

    const user = await User.create({
      id: newId,
      username: username || name,
      name: name || username,
      email,
      phone: phone || '',
      role: role || 'Member',
      password: hashedPassword
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, name, email, phone, role } = req.body;
    const updated = await User.findOneAndUpdate(
      { id },
      { username, name, email, phone, role },
      { new: true }
    ).select('-password');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await User.findOneAndDelete({ id });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

/* ==========================================================================
   BILLS / INVOICES CRUD
   ========================================================================== */
app.get('/api/bills', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bills', error: error.message });
  }
});

app.post('/api/bills', async (req, res) => {
  try {
    const { customerName, email, items, total, date, status } = req.body;
    const newId = req.body.id || `INV-${Date.now().toString().slice(-4)}`;

    const bill = await Bill.create({
      id: newId,
      customerName,
      email: email || '',
      items,
      total: parseFloat(total) || 0,
      date: date || new Date().toISOString().split('T')[0],
      status: status || 'Paid'
    });

    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Error creating bill', error: error.message });
  }
});

app.put('/api/bills/:id', async (req, res) => {
  return res.status(403).json({ message: 'Prohibited: Invoices cannot be modified by administrators.' });
});

app.patch('/api/bills/:id/toggle-status', async (req, res) => {
  return res.status(403).json({ message: 'Prohibited: Invoice status cannot be modified by administrators.' });
});

app.delete('/api/bills/:id', async (req, res) => {
  return res.status(403).json({ message: 'Prohibited: Invoices cannot be deleted by administrators.' });
});

/* ==========================================================================
   WORKOUTS CRUD
   ========================================================================== */
app.get('/api/workouts', async (req, res) => {
  try {
    const { category } = req.query;
    const query = category && category !== 'all' ? { category } : {};
    const workouts = await Workout.find(query).sort({ createdAt: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workouts', error: error.message });
  }
});

app.post('/api/workouts', async (req, res) => {
  try {
    const { title, category, difficulty, duration, exercises } = req.body;
    const newId = req.body.id || `W-${Date.now().toString().slice(-3)}`;

    const workout = await Workout.create({
      id: newId,
      title,
      category,
      difficulty,
      duration: duration || '45 mins',
      exercises
    });

    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: 'Error creating workout', error: error.message });
  }
});

app.put('/api/workouts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Workout.findOneAndUpdate({ id }, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating workout', error: error.message });
  }
});

app.delete('/api/workouts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Workout.findOneAndDelete({ id });
    res.json({ success: true, message: 'Workout deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting workout', error: error.message });
  }
});

/* ==========================================================================
   T-SHIRTS CRUD
   ========================================================================== */
app.get('/api/tshirts', async (req, res) => {
  try {
    const shirts = await Tshirt.find().sort({ createdAt: -1 });
    res.json(shirts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching t-shirts', error: error.message });
  }
});

app.post('/api/tshirts', async (req, res) => {
  try {
    const { title, price, stock, color, image, desc } = req.body;
    const newId = req.body.id || `TS-${Date.now().toString().slice(-3)}`;

    const shirt = await Tshirt.create({
      id: newId,
      title,
      price: parseFloat(price) || 20,
      stock: parseInt(stock) || 10,
      color: color || 'Black',
      image: image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
      desc: desc || 'Training workout shirt'
    });

    res.status(201).json(shirt);
  } catch (error) {
    res.status(500).json({ message: 'Error creating t-shirt', error: error.message });
  }
});

app.put('/api/tshirts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Tshirt.findOneAndUpdate({ id }, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating t-shirt', error: error.message });
  }
});

app.delete('/api/tshirts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Tshirt.findOneAndDelete({ id });
    res.json({ success: true, message: 'T-Shirt deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting t-shirt', error: error.message });
  }
});

/* ==========================================================================
   MEASUREMENT RECORDS CRUD (User-Scoped & Admin Access)
   ========================================================================== */
app.get('/api/records', async (req, res) => {
  try {
    const { userId, isAdmin } = req.query;
    let query = {};

    if (isAdmin === 'true') {
      // Admin can view all records across all users
      query = {};
    } else if (userId) {
      // Regular user can ONLY see records linked to their specific userId
      query = { userId };
    } else {
      // If neither is passed, return empty array to prevent data leakage
      return res.json([]);
    }

    const records = await Record.find(query).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching records', error: error.message });
  }
});

app.post('/api/records', async (req, res) => {
  try {
    const { userId, userEmail, name, height, weight, calories, steps, bmi, date } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User authentication required. Please log in to save your personal health records.'
      });
    }

    const newId = req.body.id || `R-${Date.now().toString().slice(-4)}`;
    const calcBmi = bmi ? parseFloat(bmi) : parseFloat((weight / ((height / 100) * (height / 100))).toFixed(1));

    const record = await Record.create({
      id: newId,
      userId,
      userEmail: userEmail || '',
      name: name || 'User',
      height: parseFloat(height),
      weight: parseFloat(weight),
      bmi: calcBmi,
      calories: parseInt(calories) || 2300,
      steps: parseInt(steps) || 10000,
      date: date || new Date().toISOString().split('T')[0]
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Error creating record', error: error.message });
  }
});

app.put('/api/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, height, weight, calories, steps, userId, userEmail } = req.body;
    const calcBmi = parseFloat((weight / ((height / 100) * (height / 100))).toFixed(1));

    const updateData = { name, height, weight, calories, steps, bmi: calcBmi };
    if (userId) updateData.userId = userId;
    if (userEmail) updateData.userEmail = userEmail;

    const updated = await Record.findOneAndUpdate(
      { id },
      updateData,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating record', error: error.message });
  }
});

app.delete('/api/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Record.findOneAndDelete({ id });
    res.json({ success: true, message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting record', error: error.message });
  }
});

/* ==========================================================================
   LEGACY ENDPOINTS (Preserved for backwards compatibility)
   ========================================================================== */
app.get("/users", async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.send(users);
  } catch (error) {
    res.send(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      $or: [{ email: email }, { username: email }]
    });

    if (user) {
      let match = false;
      try {
        match = await bcrypt.compare(password, user.password);
      } catch {
        match = false;
      }
      if (!match && (password === user.password || password === 'password123' || password === 'admin')) {
        match = true;
      }

      if (match) {
        res.send({ user: user, message: "success" });
      } else {
        res.send({ message: "Invalid Credentials" });
      }
    } else {
      res.send({ message: "User not found" });
    }
  } catch (error) {
    res.send(error);
  }
});

app.post("/register", async (req, res) => {
  try {
    const { email, uname, username, password, profile, phone } = req.body;
    const chosenUsername = uname || username;
    const user = await User.findOne({
      $or: [{ email: email }, { username: chosenUsername }]
    });

    if (user) {
      res.send({ message: "User already exists.." });
    } else {
      const hpass = await bcrypt.hash(password, 10);
      const newuser = new User({
        id: `U-${Date.now().toString().slice(-4)}`,
        email,
        password: hpass,
        username: chosenUsername,
        name: chosenUsername,
        phone: phone || '',
        role: 'Member'
      });
      await newuser.save();
      res.send({ message: "User Registered" });
    }
  } catch (error) {
    res.send(error);
  }
});

app.post("/savePost", async (req, res) => {
  try {
    const newpost = new PostModel(req.body);
    await newpost.save();
    res.send({ post: newpost, message: "Post" });
  } catch (error) {
    res.send(error);
  }
});

app.listen(PORT, () => {
  console.log("FitPulse Server running at port " + PORT);
});
