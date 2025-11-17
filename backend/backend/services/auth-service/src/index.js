// Load env from service-specific .env (keep secrets out of git)
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: __dirname + '/../.env' });

const app = express();
const PORT = process.env.PORT || 5004;

// ---------------------------
// Middleware
// ---------------------------

// Enable CORS (allow all origins for now; lock down in production)
app.use(cors());
// app.use(cors(corsOptions)); // optional: define allowed origins
// Parse incoming JSON requests
app.use(express.json());


// ---------------------------
// Routes
// ---------------------------
const authRoutes = require('./routes/authRoutes');

// Mount auth routes under /auths
app.use('/auths', authRoutes);


// ---------------------------
// Error handling
// ---------------------------

// 404 handler for unmatched routes
app.use((req, res, next) => {
    res.status(404).json({
        message: `Auth ${req.url} not found`
    });
});

// Central error handler: logs stack but hides details from client
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!'
    });
});


// ---------------------------
// Root route (for testing)
// ---------------------------
app.get('/', (req, res) => {
    res.send('Authorization Service is running (Root Route)');
});


// ---------------------------
// Start the server
// ---------------------------
app.listen(PORT, () => {
    console.log(`Authorization Service running on port ${PORT}`);
});
