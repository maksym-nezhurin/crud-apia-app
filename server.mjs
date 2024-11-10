import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import listRoutes from './utils/listRoutes.js';
import bodyParser from 'body-parser';
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

// Connect to DB
connectDB();

// Apply CORS Middleware Early
app.use(
    cors({
        origin: '*', // Replace '*' with specific origins for better security
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
    })
);

// Apply Other Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

// Serve Static Files
app.use('/uploads', express.static(join(__dirname, 'uploads')));
app.use('/uploads', (req, res) => res.status(404).send('Image not found'));

// Log Client IP
app.use((req, res, next) => {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    next();
});

// Define Routes
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/forms/booking', bookingRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/forms/checkout', checkoutRoutes);
app.get('/api/news', getLatestNews);

app.use('/api', (req, res) => {
    return res.json({ api: 'Please, use my api for getting articles!!!' });
});

app.get('/routes', (req, res) => {
    const allRoutes = listRoutes(app);
    res.json(allRoutes);
});

// Create Server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
    cors: {
        origin: '*', // Replace '*' with specific origins for better security
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    console.log('A user connected');
    const clientIp = socket.handshake.address; // Get client IP address
    console.log(`A user connected from IP: ${clientIp}`);

    // Access query parameters if sent during connection
    const queryData = socket.handshake.query;
    console.log('Connection query data:', queryData);
    socket.on('disconnect', () => console.log(`A user disconnected from IP: ${clientIp}`));
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
