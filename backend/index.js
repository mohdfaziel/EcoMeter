import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import predictionRoutes from './routes/predictionRoutes.js';
import carRoutes from './routes/carRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL] // Production frontend URL
    : ['http://localhost:3000', 'http://localhost:5173'], // Development URLs
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy (important for Render deployment)
app.set('trust proxy', 1);

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecometer';
    
    console.log('🔌 Connecting to MongoDB...');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB disconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('👋 MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check MongoDB connection
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check ML service health (optional)
    let mlServiceStatus = 'unknown';
    try {
      const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8001';
      const response = await fetch(`${mlServiceUrl}/health`, { 
        method: 'GET',
        timeout: 5000 
      });
      mlServiceStatus = response.ok ? 'healthy' : 'unhealthy';
    } catch (error) {
      mlServiceStatus = 'unavailable';
    }
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: mongoStatus,
        mlService: mlServiceStatus
      },
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'EcoMeter Backend API',
    version: '1.0.0',
    description: 'Car CO2 Emissions Prediction Service',
    endpoints: {
      predict: 'POST /api/predict',
      history: 'GET /api/history',
      stats: 'GET /api/history/stats',
      cars: 'GET /api/cars',
      carRankings: 'GET /api/cars/top',
      health: 'GET /health'
    },
    docs: {
      frontend: process.env.FRONTEND_URL || 'http://localhost:3000',
      mlService: process.env.ML_SERVICE_URL || 'http://localhost:8001'
    }
  });
});

// API routes
app.use('/api', predictionRoutes);
app.use('/api', carRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist.`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('🚨 Unhandled error:', error);
  
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred.',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Start the server
    app.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 Server started successfully!');
      console.log(`📡 Backend API running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 ML Service URL: ${process.env.ML_SERVICE_URL || 'http://localhost:8001'}`);
      console.log(`💾 MongoDB: ${process.env.MONGO_URI ? 'Atlas' : 'Local'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();