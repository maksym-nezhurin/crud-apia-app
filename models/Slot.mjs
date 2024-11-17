
import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  isBooked: { type: Boolean, default: false },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } // Reference to User model
});

export default mongoose.model('Slot', slotSchema);
