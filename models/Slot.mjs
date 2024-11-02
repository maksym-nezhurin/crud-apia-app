
import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  date: { type: Date, required: true }, // Date for the slot
  time: { type: String, required: true }, // Time, e.g., "09:00 AM"
  isBooked: { type: Boolean, default: false }, // Slot availability
});

export default mongoose.model('Slot', slotSchema);
