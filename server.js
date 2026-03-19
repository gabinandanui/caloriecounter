import app from './api/index.js';
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`\n🚀 [server]: API server is running at http://localhost:${port}`);
    console.log(`📡 [server]: Test the API at http://localhost:${port}/api\n`);
});