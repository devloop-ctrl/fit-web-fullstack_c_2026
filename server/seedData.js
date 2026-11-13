import bcrypt from 'bcrypt';
import User from './models/User.js';
import Bill from './models/Bill.js';
import Workout from './models/Workout.js';
import Tshirt from './models/Tshirt.js';
import Record from './models/Record.js';

export const INITIAL_USERS = [
  { id: 'U-101', username: 'alexsmith', name: 'Alex Smith', email: 'alex@fitpulse.io', phone: '+1 415 555 2671', role: 'Member', password: 'password123' },
  { id: 'U-102', username: 'sarajones', name: 'Sara Jones', email: 'sara@fitpulse.io', phone: '+1 415 555 8923', role: 'Trainer', password: 'password123' },
  { id: 'U-103', username: 'admin', name: 'System Admin', email: 'admin@fitpulse.io', phone: '+1 415 555 0000', role: 'Admin', password: 'admin' }
];

export const INITIAL_BILLS = [
  { id: 'INV-1001', customerName: 'Alex Smith', email: 'alex@fitpulse.io', items: 'Black Performance Training Shirt (x1)', total: 25.20, date: '2026-04-10', status: 'Paid' },
  { id: 'INV-1002', customerName: 'Sara Jones', email: 'sara@fitpulse.io', items: 'Heather Grey Athletic T-Shirt (x2)', total: 52.50, date: '2026-04-12', status: 'Pending' }
];

export const INITIAL_WORKOUTS = [
  { id: 'W-1', title: 'Chest & Arms Split', category: 'Upper Body', difficulty: 'Medium', duration: '45 mins', exercises: 'Bench Press 3x10, Incline Dumbbell Press 3x12, Push-ups 3x15, Bicep Curls 3x12.' },
  { id: 'W-2', title: 'Back & Shoulders', category: 'Upper Body', difficulty: 'Hard', duration: '50 mins', exercises: 'Pull-ups 4x8, Barbell Rows 4x10, Overhead Dumbbell Press 3x12, Lateral Raises 3x15.' },
  { id: 'W-3', title: 'Leg Day & Quads', category: 'Lower Body', difficulty: 'Hard', duration: '45 mins', exercises: 'Barbell Squats 4x8, Romanian Deadlifts 3x10, Lunges 3x12 per leg, Calf Raises 4x15.' },
  { id: 'W-4', title: 'Glutes & Hamstrings', category: 'Lower Body', difficulty: 'Medium', duration: '40 mins', exercises: 'Hip Thrusts 4x12, Leg Curls 3x15, Bulgarian Split Squats 3x10/leg.' },
  { id: 'W-5', title: 'HIIT Cardio Sprint', category: 'Cardio', difficulty: 'Hard', duration: '25 mins', exercises: 'Sprint intervals (30s sprint, 30s walk x 10), Mountain Climbers 4x45s.' },
  { id: 'W-6', title: 'Steady State Cardio', category: 'Cardio', difficulty: 'Easy', duration: '35 mins', exercises: 'Incline Treadmill Walk at 12% incline, 5 km/h for 30 minutes.' }
];

export const INITIAL_TSHIRTS = [
  { id: 'TS-1', title: 'Black Performance Training Shirt', price: 24.00, stock: 30, color: 'Black', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80', desc: 'Breathable lightweight poly-blend workout t-shirt.' },
  { id: 'TS-2', title: 'White Classic Cotton Gym Tee', price: 22.00, stock: 25, color: 'White', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&auto=format&fit=crop&q=80', desc: 'Comfortable 100% pre-shrunk cotton athletic t-shirt.' },
  { id: 'TS-3', title: 'Heather Grey Athletic T-Shirt', price: 25.00, stock: 18, color: 'Grey', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&auto=format&fit=crop&q=80', desc: 'Stretch athletic cut shirt with sweat-wicking fabric.' },
  { id: 'TS-4', title: 'Navy Blue Quick-Dry Training Tee', price: 26.00, stock: 20, color: 'Navy', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=80', desc: 'Quick-drying active tee for high intensity training.' }
];

export const INITIAL_RECORDS = [
  { id: 'R-1', name: 'Alex Smith', height: 175, weight: 70, bmi: 22.9, calories: 2320, steps: 10000, date: '2026-03-30' },
  { id: 'R-2', name: 'Sara Jones', height: 165, weight: 58, bmi: 21.3, calories: 1950, steps: 8500, date: '2026-03-31' }
];

export async function seedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial users...');
      for (const u of INITIAL_USERS) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        await User.create({ ...u, password: hashedPassword });
      }
    }

    const billCount = await Bill.countDocuments();
    if (billCount === 0) {
      console.log('Seeding initial bills...');
      await Bill.insertMany(INITIAL_BILLS);
    }

    const workoutCount = await Workout.countDocuments();
    if (workoutCount === 0) {
      console.log('Seeding initial workouts...');
      await Workout.insertMany(INITIAL_WORKOUTS);
    }

    const tshirtCount = await Tshirt.countDocuments();
    if (tshirtCount === 0) {
      console.log('Seeding initial t-shirts...');
      await Tshirt.insertMany(INITIAL_TSHIRTS);
    }

    const recordCount = await Record.countDocuments();
    if (recordCount === 0) {
      console.log('Seeding initial records...');
      await Record.insertMany(INITIAL_RECORDS);
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

