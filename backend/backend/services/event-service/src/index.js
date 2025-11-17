// Load env for this service; keep timezone and DB config consistent across services
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;


// Middleware
// Ensure JSON body parsing aligns with gateway behavior (see api-gateway)
app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require('./routes/eventRoutes');
// Mount event routes under /events
app.use('/events', userRoutes);


// Error handling middleware - add this after routes
app.use((req, res, next) => {
    // 404 handler for event service
    res.status(404).json({
        message: `Route ${req.url} not found`
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
    res.send('Event Service is running(Root Route');
});



app.listen(PORT, () => {
    console.log(`Event Service running on port ${PORT}`);
});