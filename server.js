require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
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

// Routes
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api', router.get('/' ,(req, res) => {
    return res.json({ api: 'Please use my api for getting articles!'});
}))


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on por  ${PORT}`));
