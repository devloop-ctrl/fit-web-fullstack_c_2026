import mongoose from 'mongoose';

const TshirtSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  stock: { type: Number, required: true, default: 0 },
  color: { type: String, default: 'Black' },
  image: { type: String, default: '' },
  desc: { type: String, default: '' }
}, {
  timestamps: true
});

const Tshirt = mongoose.model('Tshirt', TshirtSchema);
export default Tshirt;

