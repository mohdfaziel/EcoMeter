import React, { useState, useEffect } from 'react';
import { 
  History, 
  Trash2, 
  RefreshCw, 
  Calendar, 
  TrendingUp, 
  Car,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { predictionAPI } from '../services/api';
import ConfirmationModal from './ConfirmationModal';

const HistoryList = ({ refreshTrigger }) => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    predictionId: null,
    predictionData: null
  });
  
  // Load all predictions
  const loadPredictions = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading all predictions');
      
      // Fetch all records by using a very large limit
      const response = await predictionAPI.getHistory(1, 1000);
      
      setPredictions(response.data.predictions);
      
      console.log(`✅ Loaded ${response.data.predictions.length} predictions`);
      
    } catch (error) {
      console.error('❌ Failed to load predictions:', error);
      toast.error('Failed to load prediction history');
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  // Show delete confirmation modal
  const handleDeleteClick = (prediction) => {
    setConfirmModal({
      isOpen: true,
      predictionId: prediction._id,
      predictionData: prediction
    });
  };

  // Close confirmation modal
  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      predictionId: null,
      predictionData: null
    });
  };

  // Confirm delete
  const confirmDelete = async () => {
    const id = confirmModal.predictionId;
    
    try {
      setDeleting(id);
      console.log(`🗑️ Deleting prediction ${id}`);
      
      await predictionAPI.deletePrediction(id);
      
      // Remove from local state
      setPredictions(prev => prev.filter(p => p._id !== id));
      
      toast.success('Prediction deleted successfully');
      
      // Reload all predictions to show updated list
      loadPredictions();
      
    } catch (error) {
      console.error('❌ Failed to delete prediction:', error);
      toast.error('Failed to delete prediction');
    } finally {
      setDeleting(null);
      closeConfirmModal();
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get emission category
  const getEmissionCategory = (emission) => {
    if (emission < 150) return { label: 'Low', color: 'text-green-600 bg-green-100' };
    if (emission < 250) return { label: 'Medium', color: 'text-yellow-600 bg-yellow-100' };
    return { label: 'High', color: 'text-red-600 bg-red-100' };
  };

  // Load predictions on mount and when refreshTrigger changes
  useEffect(() => {
    loadPredictions();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="bg-slate-800/80 backdrop-blur-md rounded-lg shadow-lg p-6 h-[600px] flex flex-col border border-slate-700">
        <div className="flex items-center justify-center flex-1">
          <RefreshCw className="animate-spin mr-2 text-yellow-400" size={20} />
          <span className="text-white">Loading prediction history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-3 md:p-6 h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <History className="mr-2 text-red-300" size={24} />
          <h2 className="text-xl font-bold text-white">Prediction History</h2>
        </div>
        <div className="hidden md:flex items-center space-x-2">
          <button
            onClick={() => loadPredictions()}
            className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded transition-colors duration-200"
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-300">
            {predictions.length} predictions
          </span>
        </div>
      </div>

      {/* Empty State */}
      {predictions.length === 0 ? (
        <div className="text-center py-8">
          <Car className="mx-auto mb-4 text-slate-400" size={48} />
          <h3 className="text-lg font-medium text-white mb-2">No predictions yet</h3>
          <p className="text-slate-300">
            Make your first CO₂ emission prediction to see it here!
          </p>
        </div>
      ) : (
        <>
          {/* Predictions List - Fixed height with scrolling */}
          <div className="flex-1 overflow-y-auto border border-slate-600 rounded-lg bg-slate-900/50 prediction-history-scroll">
            <div className="space-y-3 p-3">
              {predictions.map((prediction) => {
                const category = getEmissionCategory(prediction.prediction);
                
                return (
                  <div
                    key={prediction._id}
                    className="border border-slate-600 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 bg-slate-700"
                  >
                    {/* Mobile-first layout */}
                    <div className="space-y-3">
                      {/* Header with CO2 and Delete Button */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-wrap gap-2">
                          <TrendingUp className="w-4 h-4 text-yellow-400" />
                          <span className="font-bold text-lg text-white">
                            {prediction.prediction.toFixed(1)} g CO₂/km
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${category.color}`}>
                            {category.label}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteClick(prediction)}
                          disabled={deleting === prediction._id}
                          className={`p-2 rounded-md transition-colors duration-200 ${
                            deleting === prediction._id
                              ? 'bg-slate-600 cursor-not-allowed text-slate-400'
                              : 'hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-600 hover:border-red-500/50'
                          }`}
                          title="Delete prediction"
                        >
                          {deleting === prediction._id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      
                      {/* Car Specifications - Mobile Responsive */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm text-slate-300">
                        <div className="flex justify-between sm:block">
                          <span className="font-medium">Engine:</span>
                          <span>{prediction.engineSize}L</span>
                        </div>
                        <div className="flex justify-between sm:block">
                          <span className="font-medium">Cylinders:</span>
                          <span>{prediction.cylinders}</span>
                        </div>
                        <div className="flex justify-between sm:block">
                          <span className="font-medium">Fuel:</span>
                          <span>{prediction.fuelConsumption}L/100km</span>
                        </div>
                      </div>
                      
                      {/* Timestamp */}
                      <div className="flex items-center text-xs text-slate-400">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(prediction.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}


      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmDelete}
        title="Delete Prediction"
        message={
          confirmModal.predictionData 
            ? `Are you sure you want to delete this prediction? This will permanently remove the CO₂ emission prediction of ${confirmModal.predictionData.prediction.toFixed(1)} g CO₂/km from your history.`
            : "Are you sure you want to delete this prediction?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default HistoryList;