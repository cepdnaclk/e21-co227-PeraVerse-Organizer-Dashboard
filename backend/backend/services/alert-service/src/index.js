const express = require('express');
const cors = require('cors');
require('dotenv').config();



const app = express();
const PORT = process.env.PORT || 3001;


// Middleware - fix typo
//app.use(cors());
// app.use(cors({
//   origin: 'http://localhost:5173', // or your frontend URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'], // 👈 must include this
// }));

app.use(cors()); // Enable CORS for all origins - for development purpose only


app.use(express.json());

// Routes
const alertRoutes = require('./routes/alertRoutes'); //import organizer related routes
app.use('/alerts', alertRoutes); //mount them under base path /organizers


// Root route
app.get('/', (req, res) => {
    res.send('Alert Service is running(Root Route)');
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
    console.log(`Alert Service running on port ${PORT}`);
});