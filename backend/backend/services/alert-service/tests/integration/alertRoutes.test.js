// Integration tests for alert routes
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { mockPool, mockPoolResponses } = require('../mocks/database');

// Mock the database
jest.mock('../../../../db/db.js', () => mockPool);

// Mock WebSocket
jest.mock('ws', () => require('../mocks/websocket').WebSocket);

// Mock kioskNotifier
jest.mock('../../src/utils/kioskNotifier', () => ({
  sendToKiosk: jest.fn()
}));

const alertRoutes = require('../../src/routes/alertRoutes');

describe('Alert Routes Integration Tests', () => {
  let app;
  let validToken;

  beforeAll(() => {
    // Create Express app for testing
    app = express();
    app.use(express.json());
    app.use('/alerts', alertRoutes);
    
    // Create a valid JWT token for testing
    validToken = jwt.sign(
      { 
        id: 1, 
        username: 'test@example.com' 
      },
      'test-jwt-secret-key',
      { expiresIn: '1h' }
    );
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /alerts', () => {
    it('should create a new alert successfully', async () => {
      // Arrange
      const alertData = {
        alert: 'Emergency evacuation required in Building A',
        sent_at: '2025-01-01T10:00:00Z'
      };

      mockPool.query.mockResolvedValue(
        mockPoolResponses.createAlert(alertData.alert, 'test@example.com', alertData.sent_at)
      );

      // Act
      const response = await request(app)
        .post('/alerts')
        .set('Authorization', `Bearer ${validToken}`)
        .send(alertData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: 'Alert created successfully',
        data: expect.objectContaining({
          alert: alertData.alert,
          sent_by: 'test@example.com'
        })
      });
    });

    it('should return 400 for missing alert message', async () => {
      // Act
      const response = await request(app)
        .post('/alerts')
        .set('Authorization', `Bearer ${validToken}`)
        .send({});

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Alert message is required'
      });
    });

    it('should return 400 for missing authorization header', async () => {
      // Act
      const response = await request(app)
        .post('/alerts')
        .send({
          alert: 'Test alert'
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Authorization header missing'
      });
    });

    it('should return 400 for invalid token format', async () => {
      // Act
      const response = await request(app)
        .post('/alerts')
        .set('Authorization', 'InvalidTokenFormat')
        .send({
          alert: 'Test alert'
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Token missing'
      });
    });

    it('should handle database errors', async () => {
      // Arrange
      mockPool.query.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const response = await request(app)
        .post('/alerts')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          alert: 'Test alert'
        });

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Database error while inserting alert'
      });
    });

    it('should handle very long alert messages', async () => {
      // Arrange
      const longAlert = 'A'.repeat(1000); // 1000 character alert
      mockPool.query.mockResolvedValue(
        mockPoolResponses.createAlert(longAlert, 'test@example.com')
      );

      // Act
      const response = await request(app)
        .post('/alerts')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          alert: longAlert
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.data.alert).toBe(longAlert);
    });

    it('should handle special characters in alert message', async () => {
      // Arrange
      const specialAlert = 'Alert with special chars: ñáéíóú & symbols! 🚨';
      mockPool.query.mockResolvedValue(
        mockPoolResponses.createAlert(specialAlert, 'test@example.com')
      );

      // Act
      const response = await request(app)
        .post('/alerts')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          alert: specialAlert
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.data.alert).toBe(specialAlert);
    });
  });

  describe('GET /alerts', () => {
    it('should return all alerts successfully', async () => {
      // Arrange
      mockPool.query.mockResolvedValue(mockPoolResponses.getAllAlerts());

      // Act
      const response = await request(app)
        .get('/alerts');

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toEqual(
        expect.objectContaining({
          alert_id: expect.any(Number),
          alert: expect.any(String),
          sent_by: expect.any(String)
        })
      );
    });

    it('should return 404 when no alerts exist', async () => {
      // Arrange
      mockPool.query.mockResolvedValue(mockPoolResponses.emptyResponse());

      // Act
      const response = await request(app)
        .get('/alerts');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: 'Alert not found'
      });
    });

    it('should handle database errors', async () => {
      // Arrange
      mockPool.query.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const response = await request(app)
        .get('/alerts');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Database error',
        error: 'Database connection failed'
      });
    });
  });

  describe('GET /alerts/:id', () => {
    it('should return alert by ID successfully', async () => {
      // Arrange
      const alertId = '1';
      mockPool.query.mockResolvedValue(mockPoolResponses.getAlertById(alertId));

      // Act
      const response = await request(app)
        .get(`/alerts/${alertId}`);

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toEqual(
        expect.objectContaining({
          alert_id: 1,
          alert: expect.any(String)
        })
      );
    });

    it('should return 404 for non-existent alert ID', async () => {
      // Arrange
      mockPool.query.mockResolvedValue(mockPoolResponses.emptyResponse());

      // Act
      const response = await request(app)
        .get('/alerts/999');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: 'Alerts not found'
      });
    });

    it('should handle invalid alert ID format', async () => {
      // Arrange
      mockPool.query.mockResolvedValue(mockPoolResponses.emptyResponse());

      // Act
      const response = await request(app)
        .get('/alerts/invalid-id');

      // Assert  
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: 'Alerts not found'
      });
    });

    it('should handle database errors', async () => {
      // Arrange
      mockPool.query.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const response = await request(app)
        .get('/alerts/1');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Database error',
        error: 'Database connection failed'
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON in request body', async () => {
      // Act
      const response = await request(app)
        .post('/alerts')
        .set('Authorization', `Bearer ${validToken}`)
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      // Assert
      expect(response.status).toBe(400);
    });

    it('should handle missing Content-Type header', async () => {
      // Act
      const response = await request(app)
        .post('/alerts')
        .set('Authorization', `Bearer ${validToken}`)
        .send('alert=test');

      // Assert - May return 500 due to parsing issues, but shouldn't crash
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(600);
    });
  });
});