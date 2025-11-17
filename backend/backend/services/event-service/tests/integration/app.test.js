// Integration tests for the main Express application
const request = require('supertest');
const { mockPool, setupMockSuccess, setupMockError, setupMockEmpty, resetMock } = require('../mocks/database');

// Mock the database dependency before requiring the app
jest.mock('../../../../db/db.js', () => mockPool);

// Create a test version of the Express app
const express = require('express');
const cors = require('cors');

const createTestApp = () => {
  const app = express();
  
  // Middleware
  app.use(cors());
  app.use(express.json());

  // Routes
  const eventRoutes = require('../../src/routes/eventRoutes');
  app.use('/events', eventRoutes);

  // Root route
  app.get('/', (req, res) => {
    res.send('Event Service is running(Root Route');
  });

  // Error handling middleware - add this after routes
  app.use((req, res, next) => {
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

  return app;
};

describe('Event Service Application Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    resetMock();
  });

  describe('Application Setup', () => {
    it('should respond to root route', async () => {
      // Act
      const response = await request(app)
        .get('/')
        .expect(200);

      // Assert
      expect(response.text).toBe('Event Service is running(Root Route');
    });

    it('should handle CORS preflight requests', async () => {
      // Act
      const response = await request(app)
        .options('/events')
        .expect(204);

      // Assert
      expect(response.headers['access-control-allow-origin']).toBe('*');
    });

    it('should parse JSON request bodies', async () => {
      // Arrange
      setupMockSuccess('createEvent');
      const testEvent = {
        event_name: 'JSON Test Event',
        start_time: '2024-12-01T09:00:00.000Z',
        end_time: '2024-12-01T17:00:00.000Z'
      };

      // Act
      const response = await request(app)
        .post('/events')
        .send(testEvent)
        .expect(201);

      // Assert
      expect(response.body.message).toBe('Event created successfully');
    });

    it('should handle large JSON payloads', async () => {
      // Arrange
      setupMockSuccess('createEvent');
      const largeEvent = {
        event_name: 'Large Event',
        start_time: '2024-12-01T09:00:00.000Z',
        end_time: '2024-12-01T17:00:00.000Z',
        description: 'A'.repeat(10000), // 10KB description
        media_urls: Array.from({ length: 100 }, (_, i) => `https://example.com/image${i}.jpg`),
        event_categories: Array.from({ length: 50 }, (_, i) => `category${i}`)
      };

      // Act
      const response = await request(app)
        .post('/events')
        .send(largeEvent)
        .expect(201);

      // Assert
      expect(response.body.message).toBe('Event created successfully');
    });
  });

  describe('Error Handling Middleware', () => {
    it('should return 404 for non-existent routes', async () => {
      // Act
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      // Assert
      expect(response.body).toEqual({
        message: 'Route /non-existent-route not found'
      });
    });

    it('should return 404 for non-existent nested routes', async () => {
      // Act
      const response = await request(app)
        .get('/events/nested/invalid/route')
        .expect(404);

      // Assert
      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found')
      });
    });

    it('should handle unsupported HTTP methods', async () => {
      // Act
      const response = await request(app)
        .patch('/events');

      // Assert
      expect(response.status).toBe(404);
    });

    it('should handle invalid JSON syntax', async () => {
      // Act - Express will throw 500 for malformed JSON by default
      const response = await request(app)
        .post('/events')
        .type('json')
        .send('{"invalid": json syntax}');

      // Assert - Express will handle JSON parsing errors with 400 or 500
      expect([400, 500]).toContain(response.status);
    });

    it('should handle requests with no content-type', async () => {
      // Act
      const response = await request(app)
        .post('/events')
        .send('raw text data');

      // Assert - Express may return 400 or 500 depending on parsing
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('Security Headers', () => {
    it('should include CORS headers in responses', async () => {
      // Arrange
      setupMockSuccess('getAllEvents');

      // Act
      const response = await request(app)
        .get('/events')
        .expect(200);

      // Assert
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should handle requests without origin header', async () => {
      // Arrange
      setupMockSuccess('getAllEvents');

      // Act
      const response = await request(app)
        .get('/events')
        .unset('Origin')
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe('Content Type Handling', () => {
    it('should set correct content-type for JSON responses', async () => {
      // Arrange
      setupMockSuccess('getAllEvents');

      // Act
      const response = await request(app)
        .get('/events')
        .expect(200);

      // Assert
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should handle application/json content-type in requests', async () => {
      // Arrange
      setupMockSuccess('createEvent');
      const testEvent = {
        event_name: 'Content Type Test',
        start_time: '2024-12-01T09:00:00.000Z',
        end_time: '2024-12-01T17:00:00.000Z'
      };

      // Act
      const response = await request(app)
        .post('/events')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(testEvent))
        .expect(201);

      // Assert
      expect(response.body.message).toBe('Event created successfully');
    });

    it('should reject unsupported content types for POST requests', async () => {
      // Act
      const response = await request(app)
        .post('/events')
        .set('Content-Type', 'text/plain')
        .send('plain text data');

      // Assert - Express may return 400 or 500 for unsupported content types
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('Performance', () => {
    it('should handle multiple concurrent requests', async () => {
      // Arrange
      setupMockSuccess('getAllEvents');
      const concurrentRequests = 10;
      const requests = Array.from({ length: concurrentRequests }, () => 
        request(app).get('/events')
      );

      // Act
      const responses = await Promise.all(requests);

      // Assert
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
      });
      expect(mockPool.query).toHaveBeenCalledTimes(concurrentRequests);
    });

    it('should respond within reasonable time', async () => {
      // Arrange
      setupMockSuccess('getAllEvents');
      const startTime = Date.now();

      // Act
      await request(app)
        .get('/events')
        .expect(200);

      // Assert
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(100); // Should respond within 100ms
    });

    it('should handle rapid sequential requests', async () => {
      // Arrange
      setupMockSuccess('getAllEvents');
      const requestCount = 5;

      // Act
      const responses = [];
      for (let i = 0; i < requestCount; i++) {
        const response = await request(app).get('/events');
        responses.push(response);
      }

      // Assert
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
      });
    });
  });

  describe('Request/Response Headers', () => {
    it('should handle custom request headers', async () => {
      // Arrange
      setupMockSuccess('getAllEvents');

      // Act
      const response = await request(app)
        .get('/events')
        .set('X-Custom-Header', 'test-value')
        .set('User-Agent', 'Test-Agent/1.0')
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
    });

    it('should preserve request headers in middleware', async () => {
      // Arrange
      setupMockSuccess('createEvent');
      const testEvent = {
        event_name: 'Header Test Event',
        start_time: '2024-12-01T09:00:00.000Z',
        end_time: '2024-12-01T17:00:00.000Z'
      };

      // Act
      const response = await request(app)
        .post('/events')
        .set('X-Request-ID', '12345')
        .send(testEvent)
        .expect(201);

      // Assert
      expect(response.body.message).toBe('Event created successfully');
    });

    it('should handle requests with authorization headers', async () => {
      // Arrange
      setupMockSuccess('getAllEvents');

      // Act
      const response = await request(app)
        .get('/events')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe('Error Recovery', () => {
    it('should handle database connection failures gracefully', async () => {
      // Arrange
      setupMockError('databaseConnection');

      // Act
      const response = await request(app)
        .get('/events')
        .expect(500);

      // Assert
      expect(response.body).toMatchObject({
        message: 'Database error',
        error: expect.any(String)
      });
    });

    it('should continue handling requests after errors', async () => {
      // Arrange - First request fails
      setupMockError('networkError');
      await request(app).get('/events').expect(500);

      // Arrange - Second request succeeds
      resetMock();
      setupMockSuccess('getAllEvents');

      // Act
      const response = await request(app)
        .get('/events')
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
    });

    it('should handle malformed requests without crashing', async () => {
      // Act - Send multiple malformed requests
      const response1 = await request(app)
        .post('/events')
        .send('{"invalid": json}');
      expect([400, 500]).toContain(response1.status);

      const response2 = await request(app)
        .post('/events')
        .type('json')
        .send('');
      expect([400, 500]).toContain(response2.status);

      // Should still respond to valid requests
      setupMockSuccess('getAllEvents');
      const response = await request(app)
        .get('/events')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe('Route Mounting and Middleware Order', () => {
    it('should properly mount event routes under /events prefix', async () => {
      // Arrange
      setupMockSuccess('getAllEvents');

      // Act
      const response = await request(app)
        .get('/events')
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT')
      );
    });

    it('should apply CORS middleware before route handlers', async () => {
      // Act
      const response = await request(app)
        .options('/events')
        .set('Origin', 'https://example.com')
        .set('Access-Control-Request-Method', 'GET');

      // Assert
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should apply JSON parsing middleware before route handlers', async () => {
      // Arrange
      setupMockSuccess('createEvent');
      const testEvent = {
        event_name: 'Middleware Test',
        start_time: '2024-12-01T09:00:00.000Z',
        end_time: '2024-12-01T17:00:00.000Z'
      };

      // Act
      const response = await request(app)
        .post('/events')
        .send(testEvent)
        .expect(201);

      // Assert
      expect(response.body.message).toBe('Event created successfully');
    });

    it('should apply error handling middleware after route handlers', async () => {
      // Act
      const response = await request(app)
        .get('/invalid-route')
        .expect(404);

      // Assert
      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found')
      });
    });
  });
});