const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());  // <-- This MUST be here!
app.use(express.json());

// Update CORS for production
app.use(cors({
    origin: ['http://localhost:3000', 'https://yeaty-store-gh.vercel.app'],
    credentials: true
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected!'))
  .catch(err => console.log('MongoDB Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));       // Auth routes
app.use('/api/products', require('./routes/products')); // Product routes
app.use('/api/orders', require('./routes/orders'));     // Order routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Yeaty Store API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});