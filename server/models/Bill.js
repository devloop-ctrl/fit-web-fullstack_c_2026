import mongoose from 'mongoose';

const BillSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  email: { type: String, default: '' },
  items: { type: String, required: true },
  total: { type: Number, required: true, default: 0 },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  status: { type: String, default: 'Paid', enum: ['Paid', 'Pending'] }
}, {
  timestamps: true
});

const Bill = mongoose.model('Bill', BillSchema);
export default Bill;

