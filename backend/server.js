const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
// Allow requests from GitHub Pages frontend + localhost dev
const allowedOrigins = [
  'https://tharunsmz24-sudo.github.io',
  'http://localhost:3000',
  'http://localhost:5173',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // support large base64 uploads for avatars

// Basic Route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the FitTrack Pro API',
    version: '1.0.0',
    status: 'Running'
  });
});

// Health check for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Mount Routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/workouts', require('./routes/workoutRoutes'));
app.use('/api/diet', require('./routes/dietRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
