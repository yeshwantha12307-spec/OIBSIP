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

let memoryServerInstance: any = null;
let isFallbackActive = false;

export const isUsingFallbackDB = (): boolean => isFallbackActive;

export const connectDB = async (uri?: string): Promise<typeof mongoose> => {
  const targetUri = uri || env.MONGODB_URI;
  
  try {
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
    isFallbackActive = false;
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB (${maskMongoUri(targetUri)}):`, (error as Error).message);
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }

    console.warn(`[Database Fallback] Falling back to self-contained local MongoDB engine (MongoMemoryServer) for development...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'oasis_pizza',
          launchTimeout: 60000,
        },
      });
      const localUri = memoryServerInstance.getUri();
      const conn = await mongoose.connect(localUri);
      console.log(`[Database] Connected to local fallback MongoDB at ${conn.connection.host} (DB: ${conn.connection.name})`);
      isFallbackActive = true;

      // Automatically seed demo users, inventory, and craft pizzas
      const { runSeed } = await import('../scripts/seed.js');
      await runSeed();

      return conn;
    } catch (fallbackError) {
      console.error('[Database Fatal] Both primary MongoDB and local fallback failed:', (fallbackError as Error).message);
      throw error;
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
    memoryServerInstance = null;
  }
  isFallbackActive = false;
};
