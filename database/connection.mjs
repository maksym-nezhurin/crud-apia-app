// database/connection.mjs
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();  // Load .env file

export const connectDB = async () => {
  try {
    const dbUri = process.env.MONGO_URI; // Ensure this is properly loaded
    if (!dbUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('Database disconnected');
  } catch (error) {
    console.error('Error disconnecting from the database:', error);
  }
};
