import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();  // Load .env file

let mongoServer;  // Declare mongoServer to hold the in-memory server instance

export const connectDB = async () => {
  try {
    let dbUri = process.env.MONGO_URI; // Default to real DB URI

    if (process.env.NODE_ENV === 'test') {
      mongoServer = await MongoMemoryServer.create();
      dbUri = mongoServer.getUri(); // Use in-memory server URI for tests
    }

    if (!dbUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(dbUri);
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();  // Stop the in-memory server
    }
    console.log('Database disconnected');
  } catch (error) {
    console.error('Error disconnecting from the database:', error);
  }
};
