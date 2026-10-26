import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env.js';

// Fallback to public DNS servers if local Windows/router DNS rejects SRV lookups
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignore if running in constrained sandbox
}

const maskMongoUri = (uri: string): string => {
  return uri.replace(/\/\/(.*?)@/, '//***:***@');
};

export const connectDB = async (uri?: string): Promise<typeof mongoose> => {
  const targetUri = uri || env.MONGODB_URI;
  
  try {
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB (${maskMongoUri(targetUri)}):`, (error as Error).message);
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
};
