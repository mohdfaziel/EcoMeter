import React, { useState } from "react";
import { Car, Zap, Fuel, Calculator, AlertCircle, Power } from "lucide-react";
import { toast } from "react-toastify";
import { predictionAPI } from "../services/api";

const PredictionForm = ({ onPredictionComplete }) => {
  const [formData, setFormData] = useState({
    engineSize: "",
    cylinders: "",
    fuelConsumption: "",
  });

  const [loading, setLoading] = useState(false);
  const [wakingUp, setWakingUp] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Engine Size validation
    const engineSize = parseFloat(formData.engineSize);
    if (!formData.engineSize || isNaN(engineSize)) {
      newErrors.engineSize = "Engine size is required";
    } else if (engineSize <= 0 || engineSize > 20) {
      newErrors.engineSize = "Engine size must be between 0.1 and 20.0 liters";
    }

    // Cylinders validation
    const cylinders = parseInt(formData.cylinders);
    if (!formData.cylinders || isNaN(cylinders)) {
      newErrors.cylinders = "Number of cylinders is required";
    } else if (cylinders < 3 || cylinders > 16) {
      newErrors.cylinders = "Cylinders must be between 3 and 16";
    }

    // Fuel Consumption validation
    const fuelConsumption = parseFloat(formData.fuelConsumption);
    if (!formData.fuelConsumption || isNaN(fuelConsumption)) {
      newErrors.fuelConsumption = "Fuel consumption is required";
    } else if (fuelConsumption <= 0 || fuelConsumption > 50) {
      newErrors.fuelConsumption =
        "Fuel consumption must be between 0.1 and 50.0 L/100km";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setLoading(true);

    try {
      const predictionData = {
        engineSize: parseFloat(formData.engineSize),
        cylinders: parseInt(formData.cylinders),
        fuelConsumption: parseFloat(formData.fuelConsumption),
      };

      console.log("🚗 Submitting prediction:", predictionData);

      const result = await predictionAPI.predict(predictionData);

      console.log("✅ Prediction result:", result);

      toast.success(
        `Prediction complete! CO₂ emissions: ${result.data.formattedPrediction}`
      );

      // Reset form
      setFormData({
        engineSize: "",
        cylinders: "",
        fuelConsumption: "",
      });

      // Notify parent component
      if (onPredictionComplete) {
        onPredictionComplete(result.data);
      }
    } catch (error) {
      console.error("❌ Prediction error:", error);

      if (
        error.status === 503 ||
        error.message?.includes("timeout") ||
        error.message?.includes("inactive")
      ) {
        toast.error(
          "The ML service is currently inactive. Please press the Wake Up button to start the service."
        );
      } else if (error.status === 400) {
        toast.error("Invalid input data. Please check your values.");
      } else {
        toast.error(
          error.message || "Failed to get prediction. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Wake Up ML Server
  const handleWakeUpML = async () => {
    setWakingUp(true);

    try {
      // Get ML service URL from environment variables
      const mlServiceUrl = import.meta.env.VITE_ML_SERVICE_URL;

      // Record start time for measuring response duration
      const startTime = Date.now();

      // Send request to wake up ML server with a reasonable timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

      const response = await fetch(mlServiceUrl, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Calculate response duration
      const responseDuration = Date.now() - startTime;
      console.log(`ML Service response time: ${responseDuration}ms`);

      if (response.ok) {
        // Try to read the response to get more information
        let responseText = "";
        try {
          responseText = await response.text();
        } catch (e) {
          // Ignore text parsing errors
        }

        // If response is very fast (< 3 seconds), service was likely already running
        // Also check if response contains typical running service indicators
        if (
          responseDuration < 3000 ||
          responseText.includes("FastAPI") ||
          responseText.includes("docs") ||
          responseText.includes("openapi")
        ) {
          toast.success(
            "ML services are already running and ready for predictions!"
          );
        } else {
          toast.success(
            "The ML server is waking up. Please wait a moment before predicting again."
          );
        }
      } else if (response.status === 503) {
        // Service unavailable - needs to wake up
        toast.info(
          "Wake up request sent. The ML server should be ready shortly."
        );
      } else {
        // Other status codes - check if it's actually running but different endpoint
        toast.success(
          "ML services are already running and ready for predictions!"
        );
      }
    } catch (error) {
      console.error("Wake up request error:", error);

      if (error.name === "AbortError") {
        // Request timed out - service is likely sleeping
        toast.info(
          "The ML server is starting up. Please wait a moment before predicting again."
        );
      } else if (error.message?.includes("fetch")) {
        // Network error - service might be sleeping
        toast.info(
          "Wake up request sent. The ML server should be ready shortly."
        );
      } else {
        // Other errors - still send wake up message
        toast.info(
          "Wake up request sent. The ML server should be ready shortly."
        );
      }
    } finally {
      setWakingUp(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-3 md:p-6 max-w-md mx-auto md:h-[600px] flex flex-col">
      <div className="text-center mb-6">
        <Car className="mx-auto mb-3 text-green-300" size={48} />
        <h2 className="text-2xl font-bold text-white mb-2">
          CO₂ Prediction
        </h2>
        <p className="text-slate-300 text-sm">
          Enter your car's specifications to predict CO₂ emissions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          {/* Engine Size */}
          <div>
            <label
              htmlFor="engineSize"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-slate-700 text-white placeholder-slate-400 ${
                errors.engineSize ? "border-red-500" : "border-slate-600"
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
            <label
              htmlFor="cylinders"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              <Calculator className="inline w-4 h-4 mr-1" />
              Number of Cylinders
            </label>
            <select
              id="cylinders"
              name="cylinders"
              value={formData.cylinders}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-slate-700 text-white [&>option]:bg-slate-800 [&>option]:text-white ${
                errors.cylinders ? "border-red-500" : "border-slate-600"
              }`}
              disabled={loading}
            >
              <option value="" className="bg-slate-800 text-white">
                Select cylinders
              </option>
              {[3, 4, 5, 6, 8, 10, 12, 16].map((num) => (
                <option
                  key={num}
                  value={num}
                  className="bg-slate-800 text-white"
                >
                  {num} cylinders
                </option>
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
            <label
              htmlFor="fuelConsumption"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-slate-700 text-white placeholder-slate-400 ${
                errors.fuelConsumption ? "border-red-500" : "border-slate-600"
              }`}
              disabled={loading}
            />
            {errors.fuelConsumption && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.fuelConsumption}
              </p>
            )}
            <p className="mt-1 text-xs text-slate-400">
              Combined city/highway fuel consumption
            </p>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex gap-3 mt-6">
          {/* Wake Up ML Server Button */}
          <button
            type="button"
            onClick={handleWakeUpML}
            disabled={wakingUp || loading}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              wakingUp || loading
                ? "bg-slate-600 cursor-not-allowed"
                : "bg-yellow-600 hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            } text-white`}
          >
            {wakingUp ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Waking up...
              </div>
            ) : (
              <>
                <div className="hidden md:flex items-center justify-center">
                  <Power className="w-4 h-4 mr-2" />
                  Wake Up ML
                </div>
                <div className="flex md:hidden items-center justify-center">
                  <Power className="w-4 h-4 mr-2" />
                  Wake ML
                </div>
              </>
            )}
          </button>

          {/* Predict Button */}
          <button
            type="submit"
            disabled={loading || wakingUp}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              loading || wakingUp
                ? "bg-slate-600 cursor-not-allowed"
                : "bg-slate-600 hover:bg-slate-500 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            } text-white`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Predicting...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Calculator className="w-4 h-4 mr-2" />
                Predict CO₂
              </div>
            )}
          </button>
        </div>
      </form>

      {/* Info Text */}
      <div className="mt-4 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-md">
        {!loading && !wakingUp && (
          <p className="text-xs text-yellow-300">
            <strong>
              For your first prediction, please wake up the ML service using the
              Wake Up button.
            </strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default PredictionForm;
