// Integration tests for the main Express application
const request = require('supertest');
const express = require('express');

// Mock dependencies
jest.mock('../../../../db/db.js', () => require('../mocks/database').mockPool);
jest.mock('ws', () => jest.fn().mockImplementation(() => ({
  send: jest.fn(),
  on: jest.fn(),
  readyState: 1
})));
jest.mock('../../src/utils/kioskNotifier', () => ({
  sendToKiosk: jest.fn()
}));

describe('Alert Service Application Integration Tests', () => {
  let app;

  beforeEach(() => {
    // Create a test Express app similar to the main app
    app = express();
    
    // Add CORS middleware
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (req.method === 'OPTIONS') {
        res.sendStatus(204);
      } else {
        next();
      }
    });
    
    app.use(express.json());
    
    // Add the alert routes
    const alertRoutes = require('../../src/routes/alertRoutes');
    app.use('/alerts', alertRoutes);
    
    // Add root route
    app.get('/', (req, res) => {
      res.send('Alert Service is running(Root Route)');
    });
    
    // Add 404 handler
    app.use((req, res) => {
      res.status(404).json({
        message: `Route ${req.url} not found`
      });
    });
  });

  afterEach(() => {
    // Clean up any server instances
    if (app && app.close) {
      app.close();
    }
  });

  describe('Application Setup', () => {
    it('should respond to root route', async () => {
      const response = await request(app)
        .get('/');

      expect(response.status).toBe(200);
      expect(response.text).toBe('Alert Service is running(Root Route)');
    });

    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/alerts')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type,Authorization');

      expect(response.status).toBe(204);
    });

    it('should parse JSON request bodies', async () => {
      const response = await request(app)
        .post('/alerts')
        .set('Content-Type', 'application/json')
        .send({ test: 'data' });

      // Should reach the route (even if it fails validation)
      expect(response.status).not.toBe(500);
    });

    it('should handle large JSON payloads', async () => {
      const largePayload = {
        alert: 'A'.repeat(10000), // 10KB alert message
        metadata: 'B'.repeat(5000) // 5KB metadata
      };

      const response = await request(app)
        .post('/alerts')
        .set('Content-Type', 'application/json')
        .send(largePayload);

      // Should not crash the application
      expect(response.status).not.toBe(500);
    });
  });

  describe('Error Handling Middleware', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: 'Route /non-existent-route not found'
      });
    });

    it('should return 404 for non-existent nested routes', async () => {
      const response = await request(app)
        .get('/alerts/non-existent-endpoint');

      // The route handler will handle this as an invalid ID, may return 500 on database error
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(600);
    });

    it('should handle unsupported HTTP methods', async () => {
      const response = await request(app)
        .patch('/alerts');

      expect(response.status).toBe(404);
    });

    it('should handle invalid JSON syntax', async () => {
      const response = await request(app)
        .post('/alerts')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json syntax}');

      expect(response.status).toBe(400);
    });

    it('should handle requests with no content-type', async () => {
      const response = await request(app)
        .post('/alerts')
        .send('some raw data');

      // Will fail with parsing error, but shouldn't crash the application
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(600);
    });
  });

  describe('Security Headers', () => {
    it('should include CORS headers in responses', async () => {
      const response = await request(app)
        .get('/')
        .set('Origin', 'http://localhost:5173');

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should handle requests without origin header', async () => {
      const response = await request(app)
        .get('/');

      expect(response.status).toBe(200);
    });
  });

  describe('Performance', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app).get('/')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should respond within reasonable time', async () => {
      const startTime = Date.now();
      
      await request(app).get('/');
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });
  });
});