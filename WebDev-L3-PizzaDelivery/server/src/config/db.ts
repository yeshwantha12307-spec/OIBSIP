import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async (uri?: string): Promise<typeof mongoose> => {
  const targetUri = uri || env.MONGODB_URI;
  
  try {
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB at ${targetUri}:`, (error as Error).message);
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
};
