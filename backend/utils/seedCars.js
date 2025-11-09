import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Car from '../models/Car.js';

// Load environment variables
dotenv.config();

// Car data from the requirements
const carsData = [
  {
    make: "Maruti Suzuki",
    model: "Wagon R",
    price_lakh: 6.0,
    mileage_kmpl: 24.5,
    engine_size_l: 1.0,
    co2_gkm: 94,
    comfort_rating: 7,
    space_rating: 7,
    fuel_type: "Petrol"
  },
  {
    make: "Tata",
    model: "Punch",
    price_lakh: 6.5,
    mileage_kmpl: 18.0,
    engine_size_l: 1.2,
    co2_gkm: 128,
    comfort_rating: 8,
    space_rating: 7,
    fuel_type: "Petrol"
  },
  {
    make: "Hyundai",
    model: "Creta",
    price_lakh: 11.0,
    mileage_kmpl: 19.1,
    engine_size_l: 1.5,
    co2_gkm: 121,
    comfort_rating: 9,
    space_rating: 9,
    fuel_type: "Petrol/Diesel"
  },
  {
    make: "Maruti Suzuki",
    model: "Swift",
    price_lakh: 6.5,
    mileage_kmpl: 25.0,
    engine_size_l: 1.2,
    co2_gkm: 92,
    comfort_rating: 8,
    space_rating: 6,
    fuel_type: "Petrol"
  },
  {
    make: "Maruti Suzuki",
    model: "Baleno",
    price_lakh: 9.0,
    mileage_kmpl: 22.9,
    engine_size_l: 1.2,
    co2_gkm: 101,
    comfort_rating: 8,
    space_rating: 7,
    fuel_type: "Petrol"
  },
  {
    make: "Tata",
    model: "Nexon",
    price_lakh: 8.5,
    mileage_kmpl: 20.0,
    engine_size_l: 1.5,
    co2_gkm: 116,
    comfort_rating: 9,
    space_rating: 8,
    fuel_type: "Petrol/Diesel"
  },
  {
    make: "Kia",
    model: "Seltos",
    price_lakh: 12.5,
    mileage_kmpl: 17.0,
    engine_size_l: 1.5,
    co2_gkm: 136,
    comfort_rating: 9,
    space_rating: 9,
    fuel_type: "Petrol/Diesel"
  },
  {
    make: "Maruti Suzuki",
    model: "Brezza",
    price_lakh: 11.5,
    mileage_kmpl: 17.0,
    engine_size_l: 1.5,
    co2_gkm: 136,
    comfort_rating: 8,
    space_rating: 8,
    fuel_type: "Petrol"
  },
  {
    make: "Hyundai",
    model: "i20",
    price_lakh: 7.5,
    mileage_kmpl: 18.0,
    engine_size_l: 1.2,
    co2_gkm: 128,
    comfort_rating: 8,
    space_rating: 7,
    fuel_type: "Petrol"
  },
  {
    make: "Kia",
    model: "Sonet",
    price_lakh: 8.8,
    mileage_kmpl: 18.4,
    engine_size_l: 1.2,
    co2_gkm: 125,
    comfort_rating: 8,
    space_rating: 7,
    fuel_type: "Petrol"
  },
  {
    make: "Maruti Suzuki",
    model: "Dzire",
    price_lakh: 8.0,
    mileage_kmpl: 24.0,
    engine_size_l: 1.2,
    co2_gkm: 96,
    comfort_rating: 8,
    space_rating: 7,
    fuel_type: "Petrol"
  },
  {
    make: "Honda",
    model: "City",
    price_lakh: 13.0,
    mileage_kmpl: 18.0,
    engine_size_l: 1.5,
    co2_gkm: 128,
    comfort_rating: 9,
    space_rating: 9,
    fuel_type: "Petrol"
  },
  {
    make: "Hyundai",
    model: "Venue",
    price_lakh: 8.7,
    mileage_kmpl: 18.0,
    engine_size_l: 1.2,
    co2_gkm: 128,
    comfort_rating: 8,
    space_rating: 7,
    fuel_type: "Petrol"
  },
  {
    make: "Tata",
    model: "Altroz",
    price_lakh: 7.8,
    mileage_kmpl: 19.0,
    engine_size_l: 1.2,
    co2_gkm: 122,
    comfort_rating: 8,
    space_rating: 7,
    fuel_type: "Petrol"
  },
  {
    make: "Mahindra",
    model: "Scorpio-N",
    price_lakh: 16.5,
    mileage_kmpl: 14.0,
    engine_size_l: 2.2,
    co2_gkm: 165,
    comfort_rating: 8,
    space_rating: 9,
    fuel_type: "Diesel"
  },
  {
    make: "Mahindra",
    model: "XUV700",
    price_lakh: 18.5,
    mileage_kmpl: 13.5,
    engine_size_l: 2.0,
    co2_gkm: 171,
    comfort_rating: 9,
    space_rating: 9,
    fuel_type: "Petrol/Diesel"
  },
  {
    make: "Toyota",
    model: "Innova Crysta",
    price_lakh: 19.5,
    mileage_kmpl: 12.0,
    engine_size_l: 2.4,
    co2_gkm: 193,
    comfort_rating: 9,
    space_rating: 10,
    fuel_type: "Diesel"
  },
  {
    make: "Maruti Suzuki",
    model: "Ertiga",
    price_lakh: 8.8,
    mileage_kmpl: 19.0,
    engine_size_l: 1.5,
    co2_gkm: 122,
    comfort_rating: 8,
    space_rating: 9,
    fuel_type: "Petrol"
  },
  {
    make: "Tata",
    model: "Harrier",
    price_lakh: 15.0,
    mileage_kmpl: 14.5,
    engine_size_l: 2.0,
    co2_gkm: 159,
    comfort_rating: 9,
    space_rating: 9,
    fuel_type: "Diesel"
  },
  {
    make: "Renault",
    model: "Triber",
    price_lakh: 6.5,
    mileage_kmpl: 20.0,
    engine_size_l: 1.0,
    co2_gkm: 116,
    comfort_rating: 7,
    space_rating: 8,
    fuel_type: "Petrol"
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecometer';
    console.log('🔌 Connecting to MongoDB...');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Seed function
const seedCars = async () => {
  try {
    console.log('🌱 Starting car data seeding...');
    
    // Check if cars already exist
    const existingCarsCount = await Car.countDocuments();
    
    if (existingCarsCount > 0) {
      console.log(`📊 Found ${existingCarsCount} existing cars in database`);
      
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise((resolve) => {
        rl.question('Do you want to replace existing data? (y/N): ', resolve);
      });
      
      rl.close();
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('❌ Seeding cancelled by user');
        return;
      }
      
      // Clear existing data
      console.log('🗑️ Clearing existing car data...');
      await Car.deleteMany({});
      console.log('✅ Existing data cleared');
    }
    
    // Insert new data
    console.log('📝 Inserting car data...');
    
    const insertedCars = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < carsData.length; i++) {
      try {
        const carData = carsData[i];
        const car = new Car(carData);
        const savedCar = await car.save();
        
        insertedCars.push(savedCar);
        successCount++;
        
        console.log(`✅ ${i + 1}/${carsData.length} - ${savedCar.make} ${savedCar.model} (Score: ${savedCar.score})`);
      } catch (error) {
        errorCount++;
        console.error(`❌ ${i + 1}/${carsData.length} - Failed to insert ${carsData[i].make} ${carsData[i].model}:`, error.message);
      }
    }
    
    console.log('\n📊 Seeding Summary:');
    console.log(`✅ Successfully inserted: ${successCount} cars`);
    console.log(`❌ Failed to insert: ${errorCount} cars`);
    console.log(`📈 Total cars in database: ${await Car.countDocuments()}`);
    
    // Show top 5 ranked cars
    if (insertedCars.length > 0) {
      console.log('\n🏆 Top 5 Ranked Cars:');
      const topCars = await Car.getTopRanked(5);
      topCars.forEach((car, index) => {
        console.log(`${index + 1}. ${car.make} ${car.model} - Score: ${car.score}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error seeding car data:', error.message);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    await seedCars();
    console.log('\n🎉 Car seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('👋 MongoDB connection closed');
    process.exit(0);
  }
};

// Export functions for use in other files
export { seedCars, carsData };

// Run the seeder if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}