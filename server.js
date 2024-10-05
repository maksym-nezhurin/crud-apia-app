require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const listRoutes = require('./utils/listRoutes');
const userRoutes = require('./routes/userRoutes');
const articleRoutes = require('./routes/articleRoutes');

const app = express();

const router = express.Router();

// Connect to DB
connectDB();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json()); // For parsing application/json

app.use((req, res, next) => {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(`Client IP: ${clientIp}`);
    next();
  });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api', router.get('/' ,(req, res) => {
    return res.json({ api: 'Please use my api for getting articles!'});
}));
app.get('/routes', (req, res) => {
  const allRoutes = listRoutes(app);
  res.json(allRoutes);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
