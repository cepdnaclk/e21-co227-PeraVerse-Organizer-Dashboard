// Unit tests for alertController.js
const { mockPool, mockPoolResponses } = require('../mocks/database');
const { mockWS } = require('../mocks/websocket');

// Mock dependencies
jest.mock('../../../../db/db.js', () => mockPool);
jest.mock('ws', () => require('../mocks/websocket').WebSocket);
jest.mock('../../src/utils/kioskNotifier', () => ({
  sendToKiosk: jest.fn()
}));

const {
  createAlert,
  getAlerts,
  getAlertById
} = require('../../src/controllers/alertController');

const { sendToKiosk } = require('../../src/utils/kioskNotifier');

describe('Alert Controller Unit Tests', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup mock request and response objects
    mockReq = {
      body: {},
      headers: {},
      params: {}
    };
    
    mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(() => mockRes),
      send: jest.fn(() => mockRes)
    };
  });

  describe('createAlert', () => {
    it('should create a new alert successfully', async () => {
      // Arrange
      const alertMessage = 'Emergency evacuation required';
      const testToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3RAZXhhbXBsZS5jb20iLCJpZCI6MX0.test';
      
      mockReq.body = { alert: alertMessage };
      mockReq.headers = { authorization: testToken };
      
      mockPool.query.mockResolvedValue(mockPoolResponses.createAlert(alertMessage, 'test@example.com'));

      // Act
      await createAlert(mockReq, mockRes);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO alerts'),
        expect.arrayContaining([alertMessage.trim()])
      );
      expect(sendToKiosk).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Alert created successfully',
          data: expect.objectContaining({
            alert: alertMessage
          })
        })
      );
    });

    it('should return 400 if alert message is missing', async () => {
      // Arrange
      mockReq.body = {};
      mockReq.headers = { authorization: 'Bearer valid-token' };

      // Act
      await createAlert(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Alert message is required'
      });
      expect(mockPool.query).not.toHaveBeenCalled();
    });

    it('should return 400 if authorization header is missing', async () => {
      // Arrange
      mockReq.body = { alert: 'Test alert' };
      mockReq.headers = {};

      // Act
      await createAlert(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authorization header missing'
      });
    });

    it('should return 400 if token is malformed', async () => {
      // Arrange
      mockReq.body = { alert: 'Test alert' };
      mockReq.headers = { authorization: 'InvalidTokenFormat' };

      // Act
      await createAlert(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Token missing'
      });
    });

    it('should handle database errors', async () => {
      // Arrange
      mockReq.body = { alert: 'Test alert' };
      mockReq.headers = { authorization: 'Bearer valid-token' };
      mockPool.query.mockRejectedValue(new Error('Database connection failed'));

      // Act
      await createAlert(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Database error while inserting alert'
      });
    });

    it('should trim whitespace from alert message', async () => {
      // Arrange
      const alertWithSpaces = '  Emergency alert  ';
      mockReq.body = { alert: alertWithSpaces };
      mockReq.headers = { authorization: 'Bearer valid-token' };
      mockPool.query.mockResolvedValue(mockPoolResponses.createAlert(alertWithSpaces.trim(), 'test@example.com'));

      // Act
      await createAlert(mockReq, mockRes);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO alerts'),
        expect.arrayContaining([alertWithSpaces.trim()])
      );
    });
  });

  describe('getAlerts', () => {
    it('should return all alerts successfully', async () => {
      // Arrange
      mockPool.query.mockResolvedValue(mockPoolResponses.getAllAlerts());

      // Act
      await getAlerts(mockReq, mockRes);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM alerts');
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            alert_id: expect.any(Number),
            alert: expect.any(String)
          })
        ])
      );
    });

    it('should return 404 if no alerts found', async () => {
      // Arrange
      mockPool.query.mockResolvedValue(mockPoolResponses.emptyResponse());

      // Act
      await getAlerts(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Alert not found'
      });
    });

    it('should handle database errors', async () => {
      // Arrange
      mockPool.query.mockRejectedValue(new Error('Database connection failed'));

      // Act
      await getAlerts(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Database error',
        error: 'Database connection failed'
      });
    });
  });

  describe('getAlertById', () => {
    it('should return alert by ID successfully', async () => {
      // Arrange
      const alertId = '1';
      mockReq.params = { id: alertId };
      mockPool.query.mockResolvedValue(mockPoolResponses.getAlertById(alertId));

      // Act
      await getAlertById(mockReq, mockRes);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM alerts WHERE alert_id = $1',
        [alertId]
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            alert_id: 1,
            alert: expect.any(String)
          })
        ])
      );
    });

    it('should return 404 if alert not found', async () => {
      // Arrange
      mockReq.params = { id: '999' };
      mockPool.query.mockResolvedValue(mockPoolResponses.emptyResponse());

      // Act
      await getAlertById(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Alerts not found'
      });
    });

    it('should handle database errors', async () => {
      // Arrange
      mockReq.params = { id: '1' };
      mockPool.query.mockRejectedValue(new Error('Database connection failed'));

      // Act
      await getAlertById(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Database error',
        error: 'Database connection failed'
      });
    });
  });
});