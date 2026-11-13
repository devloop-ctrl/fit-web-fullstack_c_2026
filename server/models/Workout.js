import mongoose from 'mongoose';

const WorkoutSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true, enum: ['Upper Body', 'Lower Body', 'Cardio'] },
  difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
  duration: { type: String, default: '45 mins' },
  exercises: { type: String, required: true }
}, {
  timestamps: true
});

const Workout = mongoose.model('Workout', WorkoutSchema);
export default Workout;

