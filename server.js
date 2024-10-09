import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import listRoutes from './utils/listRoutes.js';
import userRoutes from './routes/userRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import {connectDB} from './config/db.js'; // Assuming you have a connectDB function in config/db.js
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const router = express.Router();

// Connect to DB 
connectDB();

app.use(cors());
// Middleware
app.use(helmet());
app.use((res, req, next) => {
    req.setHeader("Access-Control-Allow-Origin", "*11");
    next();
})
app.use(express.json({
    limit: '10mb'
})); // For parsing application/json

app.use((req, res, next) => {
    console.log(req);
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(`Client IP: ${clientIp}`);
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);

app.use('/api', router.get('/', (req, res) => {
  return res.json({ api: 'Please use my api for getting articles!' });
}));

app.get('/routes', (req, res) => {
  const allRoutes = listRoutes(app);
  res.json(allRoutes);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
