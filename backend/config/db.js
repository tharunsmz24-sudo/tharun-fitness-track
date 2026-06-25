const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Set connection timeout to 1.5 seconds so it fails fast and switches to mock mode rather than hanging
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fittrack', {
      serverSelectionTimeoutMS: 1500
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.useMockDb = false;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.warn('\n================================================================');
    console.warn('WARNING: MongoDB is not running. SWITCHING TO MOCK DATABASE MODE.');
    console.warn('All athlete profiles, workouts, and tracking history will be saved');
    console.warn('locally to JSON files inside the "backend/data/" directory.');
    console.warn('No database installation required. The app will run without errors.');
    console.warn('================================================================\n');
    global.useMockDb = true;
  }
};

module.exports = connectDB;
