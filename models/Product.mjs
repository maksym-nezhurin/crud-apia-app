import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String, // Stores the path to the image
        required: false
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    availability: {
        type: Number,
        required: true,
        min: 0
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    }
});

export default mongoose.model('Product', productSchema);
