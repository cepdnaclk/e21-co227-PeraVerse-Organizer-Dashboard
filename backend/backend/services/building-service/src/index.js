// Load environment variables (confirm .env exists in service folder or use host env)
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5003;


// Middleware
// Caution: express.json() will parse bodies; for proxied flows ensure body
// consumption doesn't break other components.
app.use(cors());
app.use(express.json());

// Routes
const boothRoutes = require('./routes/buildingRoutes');
// Mount building routes under /buildings
app.use('/buildings', boothRoutes);


// Error handling middleware - add this after routes
app.use((req, res, next) => {
    // 404 for building routes
    res.status(404).json({
        message: `building ${req.url} not found`
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!'
    });
});


// Root route
app.get('/', (req, res) => {
    res.send('Building Service is running(Root Route)');
});



app.listen(PORT, () => {
    console.log(`Building Service running on port ${PORT}`);
});