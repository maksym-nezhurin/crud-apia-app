require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const userRoutes = require('./routes/userRoutes');
const articleRoutes = require('./routes/articleRoutes');

const app = express();

// Connect to DB
connectDB();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json()); // For parsing application/json

// Routes
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);


// Start server
const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(`Server running on port ...  ${PORT}`));
