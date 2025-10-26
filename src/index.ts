import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth.routes';
import portfolioRoutes from './routes/portfolio.routes';
import contactRoutes from './routes/contact.routes';
import uploadRoutes from './routes/upload.routes';

// Load environment variables
config();

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginEmbedderPolicy: { policy: "require-corp" }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://nicola.id'] 
    : ['http://localhost:8080', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173', 'https://nicola.id'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400 // 24 hours
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(rateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling
app.use(errorHandler);

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || '')
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
