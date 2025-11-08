import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema({
  engineSize: {
    type: Number,
    required: true,
    min: 0.1,
    max: 20.0
  },
  cylinders: {
    type: Number,
    required: true,
    min: 3,
    max: 16
  },
  fuelConsumption: {
    type: Number,
    required: true,
    min: 1.0,
    max: 50.0
  },
  prediction: {
    type: Number,
    required: true,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Optional: user tracking (for future features)
  userIp: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for faster queries
predictionSchema.index({ createdAt: -1 });
predictionSchema.index({ engineSize: 1, cylinders: 1, fuelConsumption: 1 });

// Virtual for formatted prediction
predictionSchema.virtual('formattedPrediction').get(function() {
  return `${this.prediction.toFixed(2)} g CO₂/km`;
});

// Virtual for input summary
predictionSchema.virtual('inputSummary').get(function() {
  return {
    engine: `${this.engineSize}L`,
    cylinders: this.cylinders,
    fuelConsumption: `${this.fuelConsumption}L/100km`
  };
});

// Ensure virtual fields are serialized
predictionSchema.set('toJSON', { virtuals: true });
predictionSchema.set('toObject', { virtuals: true });

export default mongoose.model('Prediction', predictionSchema);