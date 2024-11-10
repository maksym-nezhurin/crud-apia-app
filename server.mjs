import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { join } from 'path';

import { connectDB, disconnectDB } from './database/connection.mjs';
import listRoutes from './utils/listRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import slotRoutes from './routes/slotRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productsRoutes from './routes/productsRoutes.js';
import { getLatestNews } from './controllers/newsController.mjs';

dotenv.config();

const isTestEnv = process.env.NODE_ENV === 'test';

// Initialize Express app
export const app = express();

// Connect to DB
if (!isTestEnv) connectDB(); // Avoid DB connection during tests

// Middleware setup
app.use(
    cors({
        origin: '*', // Replace with specific origins if needed
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

// Serve static files
if (!isTestEnv) {
    app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
    app.use('/uploads', (req, res) => res.status(404).send('Image not found'));
}

// Add IP logger middleware
app.use((req, res, next) => {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(`Client IP: ${clientIp}`);
    next();
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
app.get('/api', (req, res) => res.json({ api: 'Please, use my api for getting articles!!!' }));
app.get('/routes', (req, res) => res.json(listRoutes(app)));

// HTTP Server and Socket.IO setup
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'https://maksym-nezhurin.github.io'], // Replace with actual origins
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => console.log('A user disconnected'));
});

// Start server
const PORT = process.env.PORT || 5000;

if (!isTestEnv) {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Exports for testing
export const closeServer = () => {
    server.close(() => console.log('Server closed'));
    disconnectDB(); // Ensure the database connection is terminated
};
