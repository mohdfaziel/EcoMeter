import axios from 'axios';

// Get backend URL from environment variables
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:10000';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    
    // Transform error for better handling in components
    const errorData = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status || 0,
      details: error.response?.data?.details || null,
    };
    
    return Promise.reject(errorData);
  }
);

// API Functions
export const predictionAPI = {
  // Predict CO2 emissions
  predict: async (data) => {
    try {
      const response = await api.post('/predict', {
        engineSize: data.engineSize,
        cylinders: data.cylinders,
        fuelConsumption: data.fuelConsumption,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get prediction history
  getHistory: async (page = 1, limit = 20) => {
    try {
      const response = await api.get('/history', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get prediction statistics
  getStats: async () => {
    try {
      const response = await api.get('/history/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a prediction
  deletePrediction: async (id) => {
    try {
      const response = await api.delete(`/history/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
    return response.data;
  } catch (error) {
    throw {
      message: 'Backend service is unavailable',
      status: 0,
      details: error.message
    };
  }
};

export default api;