
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import foodRoutes from '../routes/foodRoutes.js';
import analyzeFoodIntakeHandler from '../src/components/analyzeFoodIntake.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Your API routes
app.use('/api/foods', foodRoutes);
app.post('/api/analyzeFoodIntake', analyzeFoodIntakeHandler);

// A simple root route to check if the server is running
app.get('/api', (req, res) => {
  res.send('API Server is running!');
});

// Export the app for Vercel
export default app;
