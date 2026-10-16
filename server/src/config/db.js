import mongoose from 'mongoose';

let mongoMemoryServer = null;
let activeDatabaseInfo = {
  status: 'DISCONNECTED',
  type: 'UNKNOWN',
  isFallback: false,
  uri: null,
};

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/umcp';
  try {
    mongoose.set('strictQuery', false);
    // Set 3 second timeout for initial connection attempt
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    activeDatabaseInfo = {
      status: 'CONNECTED',
      type: 'PERSISTENT_MONGODB',
      isFallback: false,
      uri: uri.includes('@') ? uri.replace(/:([^:@]+)@/, ':***@') : uri,
    };
    console.log(`[MongoDB] Connected to database at: ${uri}`);
  } catch (err) {
    console.warn(`[MongoDB] Could not connect to primary MongoDB at ${uri} (${err.message})`);
    console.log('[MongoDB] Starting fallback in-memory MongoDB server for development...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      activeDatabaseInfo = {
        status: 'CONNECTED',
        type: 'IN_MEMORY_FALLBACK',
        isFallback: true,
        uri: memoryUri,
      };
      console.log(`[MongoDB] In-Memory MongoDB successfully connected at: ${memoryUri}`);
    } catch (memErr) {
      console.error('[MongoDB] Fatal error initializing in-memory MongoDB:', memErr);
      activeDatabaseInfo = {
        status: 'FAILED',
        type: 'NONE',
        isFallback: true,
        error: memErr.message,
      };
      throw memErr;
    }
  }
};

export const getDatabaseInfo = () => {
  return {
    ...activeDatabaseInfo,
    readyState: mongoose.connection.readyState,
  };
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
  activeDatabaseInfo.status = 'DISCONNECTED';
};
