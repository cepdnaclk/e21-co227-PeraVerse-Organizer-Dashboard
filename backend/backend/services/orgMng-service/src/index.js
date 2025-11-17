const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;


// Middleware - fix typo
app.use(cors());

app.use(express.json());

// Routes
const organizerRoutes = require('./routes/orgRoutes'); //import organizer related routes
app.use('/organizers', organizerRoutes); //mount them under base path /organizers

// Root route
app.get('/', (req, res) => {
    res.send('Organizer Service is running(Root Route)');
});

// Error handling middleware - add this after routes
app.use((req, res, next) => {
    res.status(404).json({
        message : `Route ${req.url} not found`
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!'
    });
});

//Starts the Express server and listens for requests on the specified port.
app.listen(PORT, () => {
    console.log(`Organizer Service running on port ${PORT}`);
});