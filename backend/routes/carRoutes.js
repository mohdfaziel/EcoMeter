import express from 'express';
import Car from '../models/Car.js';

const router = express.Router();

// GET /api/cars - Get all cars with optional filtering and sorting
router.get('/cars', async (req, res) => {
  try {
    const {
      fuelType,
      make,
      sortBy = 'score',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 20
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (fuelType && fuelType !== 'all') {
      filter.fuel_type = fuelType;
    }
    
    if (make && make !== 'all') {
      filter.make = new RegExp(make, 'i');
    }
    
    if (minPrice || maxPrice) {
      filter.price_lakh = {};
      if (minPrice) filter.price_lakh.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price_lakh.$lte = parseFloat(maxPrice);
    }
    
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { make: searchRegex },
        { model: searchRegex },
        { fuel_type: searchRegex }
      ];
    }

    // Build sort object
    const sort = {};
    const sortField = sortBy === 'rank' ? 'score' : sortBy;
    sort[sortField] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [cars, totalCount] = await Promise.all([
      Car.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .exec(),
      Car.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    // Add rank to each car (based on current sort)
    const carsWithRank = cars.map((car, index) => ({
      ...car.toObject(),
      rank: skip + index + 1
    }));

    res.status(200).json({
      success: true,
      data: carsWithRank,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: parseInt(limit),
        hasNextPage,
        hasPrevPage
      },
      filters: {
        fuelType,
        make,
        sortBy,
        sortOrder,
        minPrice,
        maxPrice,
        search
      }
    });

  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cars',
      message: error.message
    });
  }
});

// GET /api/cars/top - Get top ranked cars
router.get('/cars/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const topCars = await Car.getTopRanked(limit);
    
    // Add rank to each car
    const carsWithRank = topCars.map((car, index) => ({
      ...car.toObject(),
      rank: index + 1
    }));

    res.status(200).json({
      success: true,
      data: carsWithRank,
      count: carsWithRank.length
    });

  } catch (error) {
    console.error('Error fetching top cars:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top cars',
      message: error.message
    });
  }
});

// GET /api/cars/stats - Get statistics for charts
router.get('/cars/stats', async (req, res) => {
  try {
    // CO2 emissions by model (top 10)
    const co2Stats = await Car.find()
      .sort({ co2_gkm: -1 })
      .limit(10)
      .select('model make co2_gkm')
      .exec();

    // Mileage vs Price data
    const mileagePriceData = await Car.find()
      .select('model make mileage_kmpl price_lakh')
      .exec();

    // Fuel type distribution
    const fuelTypeStats = await Car.aggregate([
      {
        $group: {
          _id: '$fuel_type',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price_lakh' },
          avgMileage: { $avg: '$mileage_kmpl' },
          avgCO2: { $avg: '$co2_gkm' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Make distribution
    const makeStats = await Car.aggregate([
      {
        $group: {
          _id: '$make',
          count: { $sum: 1 },
          avgScore: { $avg: '$score' },
          avgPrice: { $avg: '$price_lakh' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Price range distribution
    const priceRangeStats = await Car.aggregate([
      {
        $bucket: {
          groupBy: '$price_lakh',
          boundaries: [0, 5, 10, 15, 20, 25, 50],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            avgMileage: { $avg: '$mileage_kmpl' },
            avgCO2: { $avg: '$co2_gkm' }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        co2Emissions: co2Stats,
        mileagePrice: mileagePriceData,
        fuelTypes: fuelTypeStats,
        makes: makeStats,
        priceRanges: priceRangeStats
      }
    });

  } catch (error) {
    console.error('Error fetching car statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

// GET /api/cars/:model - Get a specific car by model
router.get('/cars/:model', async (req, res) => {
  try {
    const { model } = req.params;
    
    const car = await Car.findOne({ 
      model: new RegExp(`^${model}$`, 'i') 
    });
    
    if (!car) {
      return res.status(404).json({
        success: false,
        error: 'Car not found',
        message: `No car found with model: ${model}`
      });
    }

    res.status(200).json({
      success: true,
      data: car
    });

  } catch (error) {
    console.error('Error fetching car:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch car',
      message: error.message
    });
  }
});

// POST /api/cars - Add a new car
router.post('/cars', async (req, res) => {
  try {
    const carData = req.body;
    
    // Validate required fields
    const requiredFields = [
      'make', 'model', 'price_lakh', 'mileage_kmpl', 
      'engine_size_l', 'co2_gkm', 'comfort_rating', 
      'space_rating', 'fuel_type'
    ];
    
    const missingFields = requiredFields.filter(field => !carData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missingFields
      });
    }

    // Check if car model already exists
    const existingCar = await Car.findOne({ 
      model: new RegExp(`^${carData.model}$`, 'i') 
    });
    
    if (existingCar) {
      return res.status(409).json({
        success: false,
        error: 'Car model already exists',
        message: `Car with model "${carData.model}" already exists`
      });
    }

    // Create new car (score will be calculated automatically)
    const newCar = new Car(carData);
    const savedCar = await newCar.save();

    res.status(201).json({
      success: true,
      data: savedCar,
      message: `Car "${savedCar.model}" added successfully with score ${savedCar.score}`
    });

  } catch (error) {
    console.error('Error creating car:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create car',
      message: error.message
    });
  }
});

// PUT /api/cars/:model - Update a car
router.put('/cars/:model', async (req, res) => {
  try {
    const { model } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;

    const updatedCar = await Car.findOneAndUpdate(
      { model: new RegExp(`^${model}$`, 'i') },
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!updatedCar) {
      return res.status(404).json({
        success: false,
        error: 'Car not found',
        message: `No car found with model: ${model}`
      });
    }

    // Recalculate score manually since pre-update middleware has limitations
    updatedCar.updateScore();
    await updatedCar.save();

    res.status(200).json({
      success: true,
      data: updatedCar,
      message: `Car "${updatedCar.model}" updated successfully with new score ${updatedCar.score}`
    });

  } catch (error) {
    console.error('Error updating car:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update car',
      message: error.message
    });
  }
});

// DELETE /api/cars/:model - Delete a car
router.delete('/cars/:model', async (req, res) => {
  try {
    const { model } = req.params;
    
    const deletedCar = await Car.findOneAndDelete({ 
      model: new RegExp(`^${model}$`, 'i') 
    });

    if (!deletedCar) {
      return res.status(404).json({
        success: false,
        error: 'Car not found',
        message: `No car found with model: ${model}`
      });
    }

    res.status(200).json({
      success: true,
      data: deletedCar,
      message: `Car "${deletedCar.model}" deleted successfully`
    });

  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete car',
      message: error.message
    });
  }
});

// GET /api/cars/search/:query - Search cars
router.get('/cars/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const cars = await Car.searchCars(query).limit(limit);
    
    res.status(200).json({
      success: true,
      data: cars,
      count: cars.length,
      query
    });

  } catch (error) {
    console.error('Error searching cars:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search cars',
      message: error.message
    });
  }
});

// GET /api/cars/filter/fuel-types - Get all available fuel types
router.get('/cars/filter/fuel-types', async (req, res) => {
  try {
    const fuelTypes = await Car.distinct('fuel_type');
    
    res.status(200).json({
      success: true,
      data: fuelTypes.sort()
    });

  } catch (error) {
    console.error('Error fetching fuel types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fuel types',
      message: error.message
    });
  }
});

// GET /api/cars/filter/makes - Get all available makes
router.get('/cars/filter/makes', async (req, res) => {
  try {
    const makes = await Car.distinct('make');
    
    res.status(200).json({
      success: true,
      data: makes.sort()
    });

  } catch (error) {
    console.error('Error fetching makes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch makes',
      message: error.message
    });
  }
});

export default router;