const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const path = require('path');
const connectToDb = require('./db/db');
const userRoutes = require('./routes/user.routes');
const captainRoutes = require('./routes/captain.routes');
const mapsRoutes = require('./routes/maps.routes');
const rideRoutes = require('./routes/ride.routes');
const paymentRoutes = require('./routes/payment.routes');

// Connect to database
connectToDb();

// CORS Configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [
            'https://ride-sharing-frontend.onrender.com',
            'https://ride-sharing-app.onrender.com',
            process.env.FRONTEND_URL
          ].filter(Boolean)
        : ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600 // 10 minutes
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Welcome to the API',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        message: 'Server is running',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/captains', captainRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/payments', paymentRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        message: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Handle CORS errors specifically
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            message: 'CORS Error: Origin not allowed',
            path: req.path,
            method: req.method,
            origin: req.headers.origin,
            allowedOrigins: corsOptions.origin
        });
    }

    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        path: req.path,
        method: req.method,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

module.exports = app;

