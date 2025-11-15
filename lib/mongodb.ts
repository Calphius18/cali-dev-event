import mongoose from 'mongoose';

// Define the shape of our cached connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the global namespace to include our mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

// MongoDB connection URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global cache to store the mongoose connection across hot reloads in development.
 * In production, this ensures we reuse the same connection instead of creating new ones.
 */
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connects to MongoDB using Mongoose.
 * 
 * This function implements connection caching to prevent multiple database connections
 * during development hot reloads and to reuse connections in serverless environments.
 * 
 * @returns {Promise<typeof mongoose>} The mongoose instance with an active connection
 */
async function dbConnect(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // If no connection exists but a connection attempt is in progress, wait for it
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable mongoose buffering to fail fast in serverless
    };

    // Create a new connection promise
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // Wait for the connection to establish
    cached.conn = await cached.promise;
  } catch (e) {
    // Reset the promise on error so the next call can retry
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
