import mongoose from 'mongoose';

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not defined in .env file');
    process.exit(1);
  }

  // Connection options for better stability
  const options = {
    serverSelectionTimeoutMS: 10000, // 10 seconds timeout for initial connection
    socketTimeoutMS: 45000, // 45 seconds timeout for operations
    maxPoolSize: 10,
    retryWrites: true,
  };

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🔄 MongoDB connection attempt ${attempt}/${MAX_RETRIES}...`);
      const conn = await mongoose.connect(mongoUri, options);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err.message);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
      });

      return conn;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${attempt} failed: ${error.message}`);

      if (attempt < MAX_RETRIES) {
        console.log(`⏳ Retrying in ${RETRY_DELAY / 1000} seconds...`);
        await sleep(RETRY_DELAY);
      } else {
        console.error('\n═══════════════════════════════════════════════════════════');
        console.error('❌ Failed to connect to MongoDB after all retry attempts.');
        console.error('');
        console.error('Please check:');
        console.error('  1. Is MongoDB running locally? Run: mongod');
        console.error('  2. Is MONGODB_URI correct in .env file?');
        console.error('  3. For MongoDB Atlas: Is your IP whitelisted?');
        console.error('  4. Check your network/firewall settings');
        console.error('');
        console.error(`Current URI: ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
        console.error('═══════════════════════════════════════════════════════════\n');
        process.exit(1);
      }
    }
  }
};

export default connectDB;
