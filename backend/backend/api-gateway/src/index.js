// File: index.js of API Gateway

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config(); // load environment variables from .env

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------
// Middleware
// ---------------------------

// NOTE: CORS is enabled globally here. 
// In production, you might want to restrict allowed origins.
app.use(cors());

// Token verification middleware for protected routes
const verifyToken = require('./middlewares/verifyToken');


// ---------------------------
// Proxy routes
// ---------------------------

// Forward requests to the organizers service
app.use('/organizers', createProxyMiddleware({
    target: 'http://localhost:5001', // organizers microservice
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl.replace(/^\/organizers/, '/organizers')
}));

// Forward requests to the events service (protected route)
app.use('/events', verifyToken, createProxyMiddleware({
    target: 'http://localhost:5002', // events microservice
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl.replace(/^\/events/, '/events')
}));

// Forward requests to the buildings service (protected route)
app.use('/buildings', verifyToken, createProxyMiddleware({
    target: 'http://localhost:5003', // buildings microservice
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl.replace(/^\/buildings/, '/buildings')
}));

// Forward requests to the auths service (no token required)
app.use('/auths', createProxyMiddleware({
    target: 'http://localhost:5004', // auths microservice
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl.replace(/^\/auths/, '/auths')
}));

app.use('/alerts', verifyToken,createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl.replace(/^\/alerts/, '/alerts')
}));


// ---------------------------
// Root route for testing
// ---------------------------
app.get('/', (req, res) => {
    res.send('API Gateway is running');
});


// ---------------------------
// Start the server
// ---------------------------
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
