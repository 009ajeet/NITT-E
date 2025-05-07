// backend/config.js
require('dotenv').config();

module.exports = {
    // Database configuration
    mongoURI: process.env.MONGO_URI,

    // JWT configuration
    jwtSecret: process.env.JWT_SECRET,

    // Email configuration
    email: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    // Server configuration
    port: process.env.PORT || 3001,

    // Frontend URL (will change in production)
    clientURL: process.env.CLIENT_URL || "http://localhost:5173"
};