import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
    available: {
        type: Boolean,
        required: true,
        default: true
    },
    numberOfRequests: {
        type: Number,
        required: true,
        default: 10
    },
    numberOfRealRequests: {
        type: Number,
        required: true,
        default: 0
    }
}, { _id: false, timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Adding a virtual field to calculate state
ServiceSchema.virtual('state').get(function() {
    if (this.numberOfRealRequests > this.numberOfRequests - 10) {
        return 'error';
    } else if (this.numberOfRealRequests < (this.numberOfRequests / 4 * 3)) {
        return 'success';
    } else {
        return 'warning';
    }
});

const ServiceAvailabilitySchema = new mongoose.Schema({
    services: {
        type: Map,
        of: ServiceSchema
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('ServiceAvailability', ServiceAvailabilitySchema);
