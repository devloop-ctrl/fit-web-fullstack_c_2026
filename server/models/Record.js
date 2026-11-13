import mongoose from 'mongoose';

const RecordSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  bmi: { type: Number, required: true },
  calories: { type: Number, required: true },
  steps: { type: Number, required: true },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, {
  timestamps: true
});

const Record = mongoose.model('Record', RecordSchema);
export default Record;

