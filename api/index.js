import connectDB from '../config/db.js';

export default async (req, res) => {
  try {
    console.log('Attempting to connect to the database in Vercel environment...');
    const db = await connectDB();
    if (db) {
      console.log('Database connection successful in Vercel environment.');
      res.status(200).send('Database connection successful.');
    } else {
      console.log('Database connection failed in Vercel environment.');
      res.status(500).send('Database connection failed.');
    }
  } catch (error) {
    console.error('An error occurred during database connection in Vercel environment:', error);
    res.status(500).send('An error occurred during database connection.');
  }
};