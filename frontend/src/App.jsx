import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Leaf, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  Github,
  Database,
  Zap
} from 'lucide-react';

import PredictionForm from './components/PredictionForm';
import HistoryList from './components/HistoryList';
import { healthCheck } from './services/api';

function App() {
  const [refreshHistoryTrigger, setRefreshHistoryTrigger] = useState(0);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [lastPrediction, setLastPrediction] = useState(null);

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const health = await healthCheck();
      setBackendStatus('healthy');
      console.log('✅ Backend health check passed:', health);
    } catch (error) {
      setBackendStatus('unhealthy');
      console.error('❌ Backend health check failed:', error);
      toast.error('Backend service is unavailable. Some features may not work.');
    }
  };

  // Handle successful prediction
  const handlePredictionComplete = (predictionData) => {
    setLastPrediction(predictionData);
    setRefreshHistoryTrigger(prev => prev + 1); // Trigger history refresh
  };

  // Get status indicator
  const getStatusIndicator = () => {
    switch (backendStatus) {
      case 'healthy':
        return (
          <div className="flex items-center text-green-600 text-sm">
            <CheckCircle className="w-4 h-4 mr-1" />
            All systems operational
          </div>
        );
      case 'unhealthy':
        return (
          <div className="flex items-center text-red-600 text-sm">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Service unavailable
          </div>
        );
      default:
        return (
          <div className="flex items-center text-yellow-600 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
            Checking status...
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">EcoMeter</h1>
                <p className="text-sm text-blue-100">Car CO₂ Emissions Predictor</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {getStatusIndicator()}
              <button
                onClick={checkBackendHealth}
                className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 text-white rounded transition-colors duration-200"
              >
                Refresh Status
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Predict Your Car's CO₂ Emissions
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Use machine learning to estimate your vehicle's environmental impact based on engine specifications.
            Get instant predictions and track your emission calculations.
          </p>
        </div>

        {/* Latest Prediction Display */}
        {lastPrediction && (
          <div className="mb-8">
            <div className="bg-green-500/20 backdrop-blur-md border border-green-500/30 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Latest Prediction</h3>
              <div className="text-3xl font-bold text-green-300 mb-2">
                {lastPrediction.formattedPrediction}
              </div>
              <p className="text-green-100 text-sm">
                Engine: {lastPrediction.input.engineSize}L • 
                Cylinders: {lastPrediction.input.cylinders} • 
                Fuel: {lastPrediction.input.fuelConsumption}L/100km
              </p>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Prediction Form */}
          <div className="lg:col-span-1">
            <PredictionForm onPredictionComplete={handlePredictionComplete} />
          </div>

          {/* History List */}
          <div className="lg:col-span-2">
            <HistoryList refreshTrigger={refreshHistoryTrigger} />
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
            <Zap className="mx-auto mb-4 text-yellow-400" size={48} />
            <h3 className="text-lg font-semibold text-white mb-2">Instant Predictions</h3>
            <p className="text-blue-100 text-sm">
              Get CO₂ emission predictions in seconds using our trained machine learning model.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
            <Database className="mx-auto mb-4 text-blue-400" size={48} />
            <h3 className="text-lg font-semibold text-white mb-2">Prediction History</h3>
            <p className="text-blue-100 text-sm">
              Track all your predictions with detailed history and the ability to compare results.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
            <Leaf className="mx-auto mb-4 text-green-400" size={48} />
            <h3 className="text-lg font-semibold text-white mb-2">Environmental Impact</h3>
            <p className="text-blue-100 text-sm">
              Make informed decisions about your vehicle's environmental footprint.
            </p>
          </div>
        </div>

        {/* Technical Info */}
        <div className="mt-16 bg-white/5 backdrop-blur-md rounded-lg p-8">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-blue-100">
            <div>
              <h4 className="font-semibold text-white mb-2">Machine Learning Model</h4>
              <p className="text-sm mb-3">
                Our prediction model is trained on real car data using Linear Regression with feature scaling. 
                The model considers three key factors:
              </p>
              <ul className="text-sm space-y-1 list-disc list-inside ml-4">
                <li>Engine Size (in liters)</li>
                <li>Number of Cylinders</li>
                <li>Combined Fuel Consumption (L/100km)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">Technology Stack</h4>
              <div className="text-sm space-y-1">
                <p><strong>Frontend:</strong> React + Vite</p>
                <p><strong>Backend:</strong> Express.js + MongoDB</p>
                <p><strong>ML Service:</strong> FastAPI + scikit-learn</p>
                <p><strong>Model:</strong> Linear Regression Pipeline</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/5 backdrop-blur-md border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="text-blue-100">
              <p className="text-sm">
                © 2024 EcoMeter. Built with React, Express.js, and Machine Learning.
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-100 hover:text-white transition-colors duration-200"
                title="View on GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-blue-100 hover:text-white transition-colors duration-200"
                title="Documentation"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;