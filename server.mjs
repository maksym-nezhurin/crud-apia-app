import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import listRoutes from './utils/listRoutes.js';
import {connectDB} from './database/connection.mjs'; // Assuming you have a connectDB function in config/db.js
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const router = express.Router();

// Connect to DB 
connectDB();

app.use(cors({
    origin: '*',
    // origin: ['http://localhost:5173', 'https://maksym-nezhurin.github.io'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Middleware
app.use(helmet());

app.use(express.json()); // For parsing application/json

app.use('/api', router.get('/', (req, res) => {
  return res.json({ api: 'Please,222 use my api for getting articles!!!' });
}));

app.get('/routes', (req, res) => {
  const allRoutes = listRoutes(app);
  res.json(allRoutes);
});

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: [
          'http://localhost:5173',
          'https://maksym-nezhurin.github.io'
        ],
        methods: ['GET', 'POST'],
    },
  });

io.on('connection', (socket) => {
    console.log('A user connected');
  
    // Handle Socket.IO events here if needed
  
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
