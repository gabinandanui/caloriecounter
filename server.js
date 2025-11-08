import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import analyzeFoodIntakeHandler from './src/components/analyzeFoodIntake.js';

const app = express();
const port = 3001;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // To parse JSON bodies

// Your API route
app.post('/api/analyzeFoodIntake', analyzeFoodIntakeHandler);

// A simple root route to check if the server is running
app.get('/', (req, res) => {
  res.send('API Server is running!');
});

app.listen(port, () => {
  console.log(`[server]: API server is running at http://localhost:${port}`);
});