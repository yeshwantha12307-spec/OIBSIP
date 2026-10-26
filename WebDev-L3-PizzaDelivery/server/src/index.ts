import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { startInventoryScheduler } from './services/cronService.js';

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    const app = createApp();

    // Start background node-cron scheduler for inventory monitoring
    startInventoryScheduler();

    app.listen(env.PORT, () => {
      console.log(`\n==================================================`);
      console.log(`🍕 Oasis Pizza API Server is running!`);
      console.log(`🚀 URL: http://localhost:${env.PORT}`);
      console.log(`📡 Environment: ${env.NODE_ENV}`);
      console.log(`💳 Razorpay Key: ${env.RAZORPAY_KEY_ID}`);
      console.log(`⏰ Cron Schedule: ${env.INVENTORY_CRON_SCHEDULE}`);
      console.log(`==================================================\n`);
    });
  } catch (error) {
    console.error('Fatal error starting Oasis Pizza server:', error);
    process.exit(1);
  }
};

startServer();
