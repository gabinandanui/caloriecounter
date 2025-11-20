import connectDB from './config/db.js';

const testDbConnection = async () => {
  try {
    console.log('Attempting to connect to the database...');
    const db = await connectDB();
    if (db) {
      console.log('Database connection successful.');
    } else {
      console.log('Database connection failed.');
    }
  } catch (error) {
    console.error('An error occurred during database connection:', error);
  }
};

testDbConnection();