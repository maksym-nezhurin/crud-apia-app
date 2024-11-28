import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    slot: {type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true}, // Reference to Slot
    date: {type: Date, required: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    logo: {type: String, default: '/uploads/logo/guest.png'},
    deletedAt: {
        type: Date,
        default: null,  // Store the deletion timestamp
    },
    isDeleted: {type: Boolean, default: false} // Soft delete functionality
}, {timestamps: true}); // This option creates 'createdAt' and 'updatedAt' fields automatically

export default mongoose.model('Booking', bookingSchema);
