import { MongoClient } from 'mongodb';
import 'dotenv/config';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;

const connectDB = async () => {
  if (db) return db;
  try {
    await client.connect();
    db = client.db('your_database_name'); // Replace with your database name
    console.log('MongoDB connected...');
    return db;
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;
