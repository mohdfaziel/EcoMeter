import React, { useState, useEffect } from 'react';
import { 
  History, 
  Trash2, 
  RefreshCw, 
  Calendar, 
  TrendingUp, 
  Car,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import { predictionAPI } from '../services/api';

const HistoryList = ({ refreshTrigger }) => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    limit: 10
  });
  
  // Load predictions
  const loadPredictions = async (page = 1) => {
    try {
      setLoading(true);
      console.log(`📊 Loading predictions page ${page}`);
      
      const response = await predictionAPI.getHistory(page, pagination.limit);
      
      setPredictions(response.data.predictions);
      setPagination(response.data.pagination);
      
      console.log(`✅ Loaded ${response.data.predictions.length} predictions`);
      
    } catch (error) {
      console.error('❌ Failed to load predictions:', error);
      toast.error('Failed to load prediction history');
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete prediction
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prediction?')) {
      return;
    }

    try {
      setDeleting(id);
      console.log(`🗑️ Deleting prediction ${id}`);
      
      await predictionAPI.deletePrediction(id);
      
      // Remove from local state
      setPredictions(prev => prev.filter(p => p._id !== id));
      
      toast.success('Prediction deleted successfully');
      
      // Refresh if current page becomes empty
      if (predictions.length === 1 && pagination.currentPage > 1) {
        loadPredictions(pagination.currentPage - 1);
      } else {
        loadPredictions(pagination.currentPage);
      }
      
    } catch (error) {
      console.error('❌ Failed to delete prediction:', error);
      toast.error('Failed to delete prediction');
    } finally {
      setDeleting(null);
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
    loadPredictions(1);
  }, [refreshTrigger]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadPredictions(newPage);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="animate-spin mr-2" size={20} />
          <span>Loading prediction history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <History className="mr-2 text-gray-600" size={24} />
          <h2 className="text-xl font-bold text-gray-800">Prediction History</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => loadPredictions(pagination.currentPage)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors duration-200"
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-500">
            {pagination.totalCount} total predictions
          </span>
        </div>
      </div>

      {/* Empty State */}
      {predictions.length === 0 ? (
        <div className="text-center py-8">
          <Car className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No predictions yet</h3>
          <p className="text-gray-600">
            Make your first CO₂ emission prediction to see it here!
          </p>
        </div>
      ) : (
        <>
          {/* Predictions List */}
          <div className="space-y-3">
            {predictions.map((prediction) => {
              const category = getEmissionCategory(prediction.prediction);
              
              return (
                <div
                  key={prediction._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between">
                    {/* Prediction Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        {/* CO2 Emission */}
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1 text-gray-500" />
                          <span className="font-bold text-lg text-gray-800">
                            {prediction.prediction.toFixed(1)} g CO₂/km
                          </span>
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${category.color}`}>
                            {category.label}
                          </span>
                        </div>
                      </div>
                      
                      {/* Car Specifications */}
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                        <div>
                          <span className="font-medium">Engine:</span> {prediction.engineSize}L
                        </div>
                        <div>
                          <span className="font-medium">Cylinders:</span> {prediction.cylinders}
                        </div>
                        <div>
                          <span className="font-medium">Fuel:</span> {prediction.fuelConsumption}L/100km
                        </div>
                      </div>
                      
                      {/* Timestamp */}
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(prediction.createdAt)}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(prediction._id)}
                      disabled={deleting === prediction._id}
                      className={`ml-4 p-2 rounded-md transition-colors duration-200 ${
                        deleting === prediction._id
                          ? 'bg-gray-100 cursor-not-allowed'
                          : 'hover:bg-red-50 text-red-600 hover:text-red-700'
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
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className={`px-3 py-1 rounded-md flex items-center text-sm ${
                    pagination.hasPreviousPage
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className={`px-3 py-1 rounded-md flex items-center text-sm ${
                    pagination.hasNextPage
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Info Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-start space-x-2 text-xs text-gray-500">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            Predictions are stored locally and will persist between sessions. 
            Delete individual predictions using the trash icon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistoryList;