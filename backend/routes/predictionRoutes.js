import express from 'express';
import axios from 'axios';
import Prediction from '../models/Prediction.js';

const router = express.Router();

// Function to wake up ML service on Render
const wakeUpMLService = async (mlServiceUrl) => {
  try {
    console.log('🔥 Waking up ML service...');
    
    // First, ping the health endpoint to wake up the service
    const healthResponse = await axios.get(`${mlServiceUrl}/health`, {
      timeout: 30000, // 30 seconds for wake up
      headers: {
        'User-Agent': 'EcoMeter-Backend-Warmup'
      }
    });
    
    console.log('✅ ML service is awake:', healthResponse.data);
    return true;
  } catch (error) {
    console.log('⚠️ Failed to wake up ML service:', error.message);
    
    // If first attempt fails, try root endpoint
    try {
      console.log('🔥 Trying root endpoint to wake up ML service...');
      await axios.get(`${mlServiceUrl}/`, {
        timeout: 30000,
        headers: {
          'User-Agent': 'EcoMeter-Backend-Warmup'
        }
      });
      console.log('✅ ML service woke up via root endpoint');
      return true;
    } catch (rootError) {
      console.log('❌ ML service wake up failed completely:', rootError.message);
      return false;
    }
  }
};

// Validation middleware
const validatePredictionInput = (req, res, next) => {
  const { engineSize, cylinders, fuelConsumption } = req.body;

  // Check if all required fields are present
  if (engineSize === undefined || cylinders === undefined || fuelConsumption === undefined) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['engineSize', 'cylinders', 'fuelConsumption']
    });
  }

  // Validate data types and ranges
  const errors = [];

  if (typeof engineSize !== 'number' || engineSize <= 0 || engineSize > 20) {
    errors.push('engineSize must be a number between 0.1 and 20.0');
  }

  if (!Number.isInteger(cylinders) || cylinders < 3 || cylinders > 16) {
    errors.push('cylinders must be an integer between 3 and 16');
  }

  if (typeof fuelConsumption !== 'number' || fuelConsumption <= 0 || fuelConsumption > 50) {
    errors.push('fuelConsumption must be a number between 0.1 and 50.0');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

// POST /api/predict - Get CO2 prediction and save to database
router.post('/predict', validatePredictionInput, async (req, res) => {
  try {
    const { engineSize, cylinders, fuelConsumption } = req.body;
    
    console.log('🔍 Prediction request:', { engineSize, cylinders, fuelConsumption });

    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8001';
    
    // First, wake up the ML service (important for Render free tier)
    await wakeUpMLService(mlServiceUrl);
    
    // Wait a brief moment for the service to fully initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Call ML Service
    const mlResponse = await axios.post(`${mlServiceUrl}/predict`, {
      ENGINESIZE: engineSize,
      CYLINDERS: cylinders,
      FUELCONSUMPTION_COMB: fuelConsumption
    }, {
      timeout: 15000, // 15 second timeout (increased for slow startup)
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const prediction = mlResponse.data.prediction;
    console.log('🤖 ML Service response:', prediction);

    // Save prediction to MongoDB
    const predictionRecord = new Prediction({
      engineSize,
      cylinders,
      fuelConsumption,
      prediction,
      userIp: req.ip,
      userAgent: req.get('User-Agent')
    });

    await predictionRecord.save();
    console.log('💾 Prediction saved to database:', predictionRecord._id);

    // Return response
    res.status(200).json({
      success: true,
      data: {
        id: predictionRecord._id,
        prediction: prediction,
        input: {
          engineSize,
          cylinders,
          fuelConsumption
        },
        formattedPrediction: `${prediction.toFixed(2)} g CO₂/km`,
        timestamp: predictionRecord.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Prediction error:', error.message);

    // Handle different types of errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        error: 'ML service unavailable',
        message: 'The machine learning service is currently unavailable. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    if (error.response && error.response.status) {
      return res.status(error.response.status).json({
        error: 'ML service error',
        message: error.response.data?.detail || 'Unknown error from ML service',
        details: process.env.NODE_ENV === 'development' ? error.response.data : undefined
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Database validation error',
        message: error.message
      });
    }

    // Generic error
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your request.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/history - Get prediction history
router.get('/history', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Ensure reasonable limits
    const safeLimit = Math.min(limit, 100);

    console.log(`📊 Fetching history: page ${page}, limit ${safeLimit}`);

    // Get predictions with pagination
    const predictions = await Prediction.find()
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(safeLimit)
      .select('-userIp -userAgent -__v'); // Exclude sensitive/unnecessary fields

    // Get total count for pagination info
    const totalCount = await Prediction.countDocuments();
    const totalPages = Math.ceil(totalCount / safeLimit);

    console.log(`📈 Retrieved ${predictions.length} predictions (total: ${totalCount})`);

    res.status(200).json({
      success: true,
      data: {
        predictions,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          limit: safeLimit
        }
      }
    });

  } catch (error) {
    console.error('❌ History fetch error:', error.message);

    res.status(500).json({
      error: 'Database error',
      message: 'Failed to retrieve prediction history.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/history/stats - Get prediction statistics
router.get('/history/stats', async (req, res) => {
  try {
    console.log('📊 Fetching prediction statistics');

    const stats = await Prediction.aggregate([
      {
        $group: {
          _id: null,
          totalPredictions: { $sum: 1 },
          avgPrediction: { $avg: '$prediction' },
          minPrediction: { $min: '$prediction' },
          maxPrediction: { $max: '$prediction' },
          avgEngineSize: { $avg: '$engineSize' },
          avgCylinders: { $avg: '$cylinders' },
          avgFuelConsumption: { $avg: '$fuelConsumption' }
        }
      }
    ]);

    // Get recent activity (predictions per day for last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await Prediction.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const result = {
      overview: stats[0] || {
        totalPredictions: 0,
        avgPrediction: 0,
        minPrediction: 0,
        maxPrediction: 0,
        avgEngineSize: 0,
        avgCylinders: 0,
        avgFuelConsumption: 0
      },
      recentActivity
    };

    console.log(`📈 Statistics: ${result.overview.totalPredictions} total predictions`);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Statistics error:', error.message);

    res.status(500).json({
      error: 'Database error',
      message: 'Failed to retrieve prediction statistics.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/history/:id - Delete a specific prediction
router.delete('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Deleting prediction: ${id}`);

    const deletedPrediction = await Prediction.findByIdAndDelete(id);

    if (!deletedPrediction) {
      return res.status(404).json({
        error: 'Prediction not found',
        message: 'The specified prediction does not exist.'
      });
    }

    console.log(`✅ Prediction deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Prediction deleted successfully',
      data: {
        deletedId: id
      }
    });

  } catch (error) {
    console.error('❌ Delete error:', error.message);

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'The provided prediction ID is not valid.'
      });
    }

    res.status(500).json({
      error: 'Database error',
      message: 'Failed to delete prediction.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;