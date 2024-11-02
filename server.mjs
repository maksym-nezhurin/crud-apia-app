import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import listRoutes from './utils/listRoutes.js';
import bodyParser from 'body-parser';
import articleRoutes from './routes/articleRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import slotRoutes from './routes/slotRoutes.js'
import {connectDB} from './database/connection.mjs'; // Assuming you have a connectDB function in config/db.js
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const router = express.Router();

// Connect to DB 
connectDB();

app.use(cors());
// Middleware
app.use(bodyParser.json()); // Parses JSON requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use((res, req, next) => {
    req.setHeader("Access-Control-Allow-Origin", "*");
    next();
})
app.use(express.json()); // For parsing application/json

app.use((req, res, next) => {
    req.io = io;  // Attach `io` to the request object
    next();
});


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

app.use('/api', router.get('/', (req, res) => {
  return res.json({ api: 'Please use my api for getting articles!' });
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
