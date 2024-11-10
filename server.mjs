import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import listRoutes from './utils/listRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';
import { getLatestNews } from './controllers/newsController.mjs';
import aiRoutes from './routes/aiRoutes.js';
import slotRoutes from './routes/slotRoutes.js';
import { connectDB } from './database/connection.mjs';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import userRoutes from "./routes/userRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();

// Connect to DB
connectDB();

app.use(cors({
    origin: '*',
    // origin: ['http://localhost:5173', 'https://maksym-nezhurin.github.io'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
// Middleware
app.use(helmet());

app.use(express.json()); // For parsing application/json

app.use((req, res, next) => {
    req.io = io;  // Attach `io` to the request object
    next();
});

// Serve static files
app.use('/uploads', express.static(join(__dirname, 'uploads')));
// Middleware to handle missing files

app.use('/uploads', (req, res) => {
    res.status(404).send('Image not found');
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/forms/booking', bookingRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/forms/checkout', checkoutRoutes);
app.get('/api/news', getLatestNews);

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
        origin: '*', // Replace '*' with specific origins for better security
        methods: ['GET', 'POST'],
    },
  });

io.on('connection', (socket) => {
    console.log('A user connected');
  
    // Handle Socket.IO events here if needed

    // Listen for typing event
    socket.on('typing', (data) => {
        socket.broadcast.emit('userTyping', data);
    });

    // Listen for stop typing event
    socket.on('stopTyping', (data) => {
        // Broadcast to all other users except the sender
        socket.broadcast.emit('userStopTyping', data);
    });
  
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
