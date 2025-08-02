// backend/server.js
import 'dotenv/config'; // Replaces require('dotenv').config()
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.js'; // Note the .js extension

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'], // Allows both variants
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Explicitly allow methods used in auth
  allowedHeaders: ['Content-Type', 'Authorization'] // For JWT tokens
})); 
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Auth Routes
app.use('/api/auth', authRoutes);

app.use('/api/posts', (await import('./routes/posts.js')).default);

app.use('/api/comments', (await import('./routes/comments.js')).default);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
