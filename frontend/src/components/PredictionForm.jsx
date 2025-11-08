import React, { useState } from 'react';
import { Car, Zap, Fuel, Calculator, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { predictionAPI } from '../services/api';

const PredictionForm = ({ onPredictionComplete }) => {
  const [formData, setFormData] = useState({
    engineSize: '',
    cylinders: '',
    fuelConsumption: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Engine Size validation
    const engineSize = parseFloat(formData.engineSize);
    if (!formData.engineSize || isNaN(engineSize)) {
      newErrors.engineSize = 'Engine size is required';
    } else if (engineSize <= 0 || engineSize > 20) {
      newErrors.engineSize = 'Engine size must be between 0.1 and 20.0 liters';
    }

    // Cylinders validation
    const cylinders = parseInt(formData.cylinders);
    if (!formData.cylinders || isNaN(cylinders)) {
      newErrors.cylinders = 'Number of cylinders is required';
    } else if (cylinders < 3 || cylinders > 16) {
      newErrors.cylinders = 'Cylinders must be between 3 and 16';
    }

    // Fuel Consumption validation
    const fuelConsumption = parseFloat(formData.fuelConsumption);
    if (!formData.fuelConsumption || isNaN(fuelConsumption)) {
      newErrors.fuelConsumption = 'Fuel consumption is required';
    } else if (fuelConsumption <= 0 || fuelConsumption > 50) {
      newErrors.fuelConsumption = 'Fuel consumption must be between 0.1 and 50.0 L/100km';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const predictionData = {
        engineSize: parseFloat(formData.engineSize),
        cylinders: parseInt(formData.cylinders),
        fuelConsumption: parseFloat(formData.fuelConsumption)
      };

      console.log('🚗 Submitting prediction:', predictionData);

      const result = await predictionAPI.predict(predictionData);
      
      console.log('✅ Prediction result:', result);

      toast.success(`Prediction complete! CO₂ emissions: ${result.data.formattedPrediction}`);
      
      // Reset form
      setFormData({
        engineSize: '',
        cylinders: '',
        fuelConsumption: ''
      });

      // Notify parent component
      if (onPredictionComplete) {
        onPredictionComplete(result.data);
      }

    } catch (error) {
      console.error('❌ Prediction error:', error);
      
      if (error.status === 503) {
        toast.error('ML service is temporarily unavailable. Please try again later.');
      } else if (error.status === 400) {
        toast.error('Invalid input data. Please check your values.');
      } else {
        toast.error(error.message || 'Failed to get prediction. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick fill buttons for common car types
  const quickFillOptions = [
    { 
      name: 'Compact Car', 
      data: { engineSize: '1.8', cylinders: '4', fuelConsumption: '7.5' } 
    },
    { 
      name: 'Sedan', 
      data: { engineSize: '2.5', cylinders: '4', fuelConsumption: '9.0' } 
    },
    { 
      name: 'SUV', 
      data: { engineSize: '3.5', cylinders: '6', fuelConsumption: '11.5' } 
    },
    { 
      name: 'Pickup Truck', 
      data: { engineSize: '5.0', cylinders: '8', fuelConsumption: '14.0' } 
    }
  ];

  const handleQuickFill = (option) => {
    setFormData(option.data);
    setErrors({});
    toast.info(`Pre-filled with ${option.name} values`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <Car className="mx-auto mb-3 text-blue-600" size={48} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">CO₂ Prediction</h2>
        <p className="text-gray-600 text-sm">
          Enter your car's specifications to predict CO₂ emissions
        </p>
      </div>

      {/* Quick Fill Options */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Fill (Common Car Types):
        </label>
        <div className="grid grid-cols-2 gap-2">
          {quickFillOptions.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleQuickFill(option)}
              className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors duration-200"
              disabled={loading}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Engine Size */}
        <div>
          <label htmlFor="engineSize" className="block text-sm font-medium text-gray-700 mb-1">
            <Zap className="inline w-4 h-4 mr-1" />
            Engine Size (L)
          </label>
          <input
            type="number"
            id="engineSize"
            name="engineSize"
            value={formData.engineSize}
            onChange={handleChange}
            step="0.1"
            min="0.1"
            max="20"
            placeholder="e.g., 2.5"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.engineSize ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.engineSize && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.engineSize}
            </p>
          )}
        </div>

        {/* Cylinders */}
        <div>
          <label htmlFor="cylinders" className="block text-sm font-medium text-gray-700 mb-1">
            <Calculator className="inline w-4 h-4 mr-1" />
            Number of Cylinders
          </label>
          <select
            id="cylinders"
            name="cylinders"
            value={formData.cylinders}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.cylinders ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          >
            <option value="">Select cylinders</option>
            {[3, 4, 5, 6, 8, 10, 12, 16].map(num => (
              <option key={num} value={num}>{num} cylinders</option>
            ))}
          </select>
          {errors.cylinders && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.cylinders}
            </p>
          )}
        </div>

        {/* Fuel Consumption */}
        <div>
          <label htmlFor="fuelConsumption" className="block text-sm font-medium text-gray-700 mb-1">
            <Fuel className="inline w-4 h-4 mr-1" />
            Fuel Consumption (L/100km)
          </label>
          <input
            type="number"
            id="fuelConsumption"
            name="fuelConsumption"
            value={formData.fuelConsumption}
            onChange={handleChange}
            step="0.1"
            min="0.1"
            max="50"
            placeholder="e.g., 9.5"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.fuelConsumption ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.fuelConsumption && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.fuelConsumption}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Combined city/highway fuel consumption
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md font-medium transition-all duration-200 ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          } text-white`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Predicting...
            </div>
          ) : (
            'Predict CO₂ Emissions'
          )}
        </button>
      </form>

      {/* Info Text */}
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> This prediction is based on a machine learning model trained on real car data. 
          Results are estimates and may vary from actual emissions.
        </p>
      </div>
    </div>
  );
};

export default PredictionForm;