import mongoose from 'mongoose';

const AIImageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    imageData: { type: String, required: true }, // This field will store the base64 encoded data
}, { timestamps: true });

const AIImage = mongoose.model('AIImage', AIImageSchema);

export default AIImage;
