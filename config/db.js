import { MongoClient } from 'mongodb';
import 'dotenv/config';

const uri = process.env.MONGODB_URI;
let db;
let client;

const connectDB = async () => {
  if (db) return db;
  if (!uri) {
    console.error('MONGODB_URI is not set in environment');
    return null;
  }
  try {
    if (!client) {
      client = new MongoClient(uri);
    }
    await client.connect();
    db = client.db('your_database_name'); // Replace with your database name
    console.log('MongoDB connected...');
    return db;
  } catch (err) {
    console.error('Database connection error:', err.message);
    return null; // Return null instead of exiting the process
  }
};

export default connectDB;
