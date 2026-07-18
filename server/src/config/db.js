import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;

export const connectDB = async () => {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'your_mongodb_uri_here') {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.warn(`External MongoDB failed: ${error.message}`);
      console.warn('Falling back to in-memory MongoDB...');
    }
  }
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log(`In-memory MongoDB started at ${uri}`);
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
};
