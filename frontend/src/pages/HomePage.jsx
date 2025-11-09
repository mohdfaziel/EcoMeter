import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Zap,
  Database,
  Leaf
} from 'lucide-react';

import PredictionForm from '../components/PredictionForm';
import HistoryList from '../components/HistoryList';

const HomePage = () => {
  const [refreshHistoryTrigger, setRefreshHistoryTrigger] = useState(0);
  const [lastPrediction, setLastPrediction] = useState(null);

  // Handle successful prediction
  const handlePredictionComplete = (predictionData) => {
    setLastPrediction(predictionData);
    setRefreshHistoryTrigger(prev => prev + 1); // Trigger history refresh
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
          Predict Your Car's CO₂ Emissions
        </h2>
        <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
         This prediction is based on a machine learning model trained on real car data. 
        Results are estimates and may vary from actual emissions.
        </p>
      </div>

      {/* Latest Prediction Display */}
      {lastPrediction && (
        <div className="mb-8">
          <div className="bg-green-500/20 backdrop-blur-md border border-green-500/30 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Latest Prediction</h3>
            <div className="text-2xl md:text-3xl font-bold text-green-300 mb-2">
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
    </div>
  );
};

export default HomePage;