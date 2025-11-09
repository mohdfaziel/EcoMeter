import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  make: {
    type: String,
    required: [true, 'Car make is required'],
    trim: true,
    maxLength: [50, 'Make cannot exceed 50 characters']
  },
  model: {
    type: String,
    required: [true, 'Car model is required'],
    trim: true,
    maxLength: [100, 'Model cannot exceed 100 characters'],
    unique: true,
    index: true
  },
  price_lakh: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    max: [1000, 'Price cannot exceed 1000 lakhs']
  },
  mileage_kmpl: {
    type: Number,
    required: [true, 'Mileage is required'],
    min: [1, 'Mileage must be at least 1 kmpl'],
    max: [50, 'Mileage cannot exceed 50 kmpl']
  },
  engine_size_l: {
    type: Number,
    required: [true, 'Engine size is required'],
    min: [0.1, 'Engine size must be at least 0.1L'],
    max: [10, 'Engine size cannot exceed 10L']
  },
  co2_gkm: {
    type: Number,
    required: [true, 'CO2 emissions are required'],
    min: [1, 'CO2 emissions must be at least 1 g/km'],
    max: [1000, 'CO2 emissions cannot exceed 1000 g/km']
  },
  comfort_rating: {
    type: Number,
    required: [true, 'Comfort rating is required'],
    min: [1, 'Comfort rating must be between 1 and 10'],
    max: [10, 'Comfort rating must be between 1 and 10']
  },
  space_rating: {
    type: Number,
    required: [true, 'Space rating is required'],
    min: [1, 'Space rating must be between 1 and 10'],
    max: [10, 'Space rating must be between 1 and 10']
  },
  fuel_type: {
    type: String,
    required: [true, 'Fuel type is required'],
    enum: {
      values: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'Petrol/Diesel'],
      message: 'Fuel type must be one of: Petrol, Diesel, Electric, Hybrid, CNG, Petrol/Diesel'
    }
  },
  score: {
    type: Number,
    default: 0,
    index: true // Index for efficient sorting
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Static method to calculate ranking score
// Formula: score = (mileage_kmpl * 2) + (comfort_rating * 1.5) + (space_rating * 1.2) - (co2_gkm * 0.3) - (price_lakh * 0.5)
carSchema.statics.calculateScore = function(carData) {
  const {
    mileage_kmpl,
    comfort_rating,
    space_rating,
    co2_gkm,
    price_lakh
  } = carData;

  const score = (mileage_kmpl * 2) + 
                (comfort_rating * 1.5) + 
                (space_rating * 1.2) - 
                (co2_gkm * 0.3) - 
                (price_lakh * 0.5);

  return Math.round(score * 100) / 100; // Round to 2 decimal places
};

// Instance method to calculate and update score
carSchema.methods.updateScore = function() {
  this.score = this.constructor.calculateScore(this);
  return this.score;
};

// Pre-save middleware to automatically calculate score
carSchema.pre('save', function(next) {
  // Calculate score before saving
  this.score = this.constructor.calculateScore(this);
  next();
});

// Pre-update middleware to recalculate score on updates
carSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  
  // If any score-affecting field is being updated, recalculate score
  if (update.mileage_kmpl || update.comfort_rating || update.space_rating || 
      update.co2_gkm || update.price_lakh) {
    
    // We need to get the current document to calculate the new score
    this.setUpdate({
      ...update,
      updatedAt: new Date()
    });
  }
  
  next();
});

// Virtual for formatted price
carSchema.virtual('formatted_price').get(function() {
  return `₹${this.price_lakh} Lakh`;
});

// Virtual for formatted mileage
carSchema.virtual('formatted_mileage').get(function() {
  return `${this.mileage_kmpl} km/l`;
});

// Virtual for formatted CO2 emissions
carSchema.virtual('formatted_co2').get(function() {
  return `${this.co2_gkm} g/km`;
});

// Virtual for efficiency rating (based on mileage and CO2)
carSchema.virtual('efficiency_rating').get(function() {
  const efficiency = (this.mileage_kmpl / this.co2_gkm) * 1000;
  if (efficiency >= 200) return 'Excellent';
  if (efficiency >= 150) return 'Good';
  if (efficiency >= 100) return 'Average';
  return 'Poor';
});

// Static method to get top ranked cars
carSchema.statics.getTopRanked = function(limit = 10) {
  return this.find()
    .sort({ score: -1 }) // Sort by score descending
    .limit(limit)
    .exec();
};

// Static method to get cars by fuel type
carSchema.statics.getByFuelType = function(fuelType) {
  return this.find({ fuel_type: fuelType })
    .sort({ score: -1 })
    .exec();
};

// Static method to get cars by make
carSchema.statics.getByMake = function(make) {
  return this.find({ make: new RegExp(make, 'i') })
    .sort({ score: -1 })
    .exec();
};

// Static method to get cars within price range
carSchema.statics.getByPriceRange = function(minPrice, maxPrice) {
  return this.find({
    price_lakh: { $gte: minPrice, $lte: maxPrice }
  })
  .sort({ score: -1 })
  .exec();
};

// Static method to search cars
carSchema.statics.searchCars = function(query) {
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    $or: [
      { make: searchRegex },
      { model: searchRegex },
      { fuel_type: searchRegex }
    ]
  })
  .sort({ score: -1 })
  .exec();
};

// Index for text search
carSchema.index({
  make: 'text',
  model: 'text',
  fuel_type: 'text'
});

// Compound indexes for efficient filtering
carSchema.index({ fuel_type: 1, score: -1 });
carSchema.index({ make: 1, score: -1 });
carSchema.index({ price_lakh: 1, score: -1 });

const Car = mongoose.model('Car', carSchema);

export default Car;