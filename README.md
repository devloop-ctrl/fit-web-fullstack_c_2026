# FitPulse - Full-Stack Health & Fitness Platform

FitPulse is a modern, responsive full-stack health and fitness web application built with React, Redux Toolkit, Node.js, Express, and MongoDB.

## Features

- **Health Calculators:** Interactive BMI Calculator, Calorie Requirement Calculator, and Daily Step Target Estimator.
- **Personal Measurement Log:** Save body measurements directly to MongoDB with historical tracking.
- **T-Shirt Store:** Catalog of training apparel with live shopping cart.
- **Cart & Invoicing System:** Slide-out shopping cart with automatic invoice and bill generation upon checkout.
- **Workout Routines:** Targeted routines organized by muscle group (Upper Body, Lower Body, Cardio) with difficulty levels and exercise lists.
- **Admin Management Dashboard:** Complete CRUD interface for Invoices, User Accounts, Workouts, T-Shirts, and Measurement Records.
- **Authentication:** Secure user login, account registration, and password recovery.

---

## Security & API Configuration

> **IMPORTANT:** Never commit `.env` files or API secrets to version control.

### Setup Environment Variables

1. Navigate to the `server/` directory:
   ```bash
   cd server
   cp .env.example .env
   ```
2. Update `.env` with your secure MongoDB credentials and port:
   ```env
   PORT=3003
   MONGODB_URI=your_mongodb_connection_string
   ```

---

## Installation & Running

### 1. Backend Server
```bash
cd server
npm install
npm run dev
```

### 2. Frontend Client
```bash
cd client
npm install
npm run dev
```

The application will run on `http://localhost:5173`.
