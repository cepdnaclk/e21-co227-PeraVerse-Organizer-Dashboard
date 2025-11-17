// Integration tests for eventRoutes.js
const request = require('supertest');
const { mockPool, setupMockSuccess, setupMockError, setupMockEmpty, resetMock } = require('../mocks/database');
const { sampleEvents, invalidEvents, generateTestEvent } = require('../helpers/testData');

// Mock the database dependency before requiring the app
jest.mock('../../../../db/db.js', () => mockPool);

// Create a test version of the Express app without starting the server
const express = require('express');
const cors = require('cors');
const eventRoutes = require('../../src/routes/eventRoutes');

const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/events', eventRoutes);
  
  // Error handling middleware
  app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.url} not found` });
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
  });

  return app;
};

describe('Event Routes Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    resetMock();
  });

  describe('GET /events', () => {
    it('should return all events successfully', async () => {
      // Arrange
      setupMockSuccess('getAllEvents');

      // Act
      const response = await request(app)
        .get('/events')
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toMatchObject({
        event_id: expect.any(Number),
        event_name: expect.any(String),
        start_time: expect.any(String),
        end_time: expect.any(String)
      });
    });

    it('should return empty array when no events exist', async () => {
      // Arrange
      setupMockEmpty();

      // Act
      const response = await request(app)
        .get('/events')
        .expect(200);

      // Assert
      expect(response.body).toEqual([]);
    });

    it('should return 500 for database errors', async () => {
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

    it('should handle CORS preflight requests', async () => {
      // Act
      const response = await request(app)
        .options('/events');

      // Assert
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('GET /events/:id', () => {
    it('should return event by ID successfully', async () => {
      // Arrange
      setupMockSuccess('getEventById');

      // Act
      const response = await request(app)
        .get('/events/1')
        .expect(200);

      // Assert
      expect(response.body).toMatchObject({
        event_id: expect.any(Number),
        event_name: expect.any(String),
        start_time: expect.any(String),
        end_time: expect.any(String)
      });
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE event_id = $1'),
        ['1']
      );
    });

    it('should return 404 for non-existent event ID', async () => {
      // Arrange
      setupMockEmpty();

      // Act
      const response = await request(app)
        .get('/events/999')
        .expect(404);

      // Assert
      expect(response.body).toEqual({
        message: 'Event not found'
      });
    });

    it('should handle invalid event ID format', async () => {
      // Arrange
      setupMockEmpty();

      // Act
      const response = await request(app)
        .get('/events/invalid-id')
        .expect(404);

      // Assert
      expect(response.body).toEqual({
        message: 'Event not found'
      });
    });

    it('should return 500 for database errors', async () => {
      // Arrange
      setupMockError('queryTimeout');

      // Act
      const response = await request(app)
        .get('/events/1')
        .expect(500);

      // Assert
      expect(response.body).toMatchObject({
        message: 'Database error',
        error: expect.any(String)
      });
    });
  });

  describe('POST /events', () => {
    it('should create a new event successfully', async () => {
      // Arrange
      setupMockSuccess('createEvent');

      // Act
      const response = await request(app)
        .post('/events')
        .send(sampleEvents.validEvent)
        .expect(201);

      // Assert
      expect(response.body).toMatchObject({
        message: 'Event created successfully',
        event: expect.objectContaining({
          event_id: expect.any(Number),
          event_name: expect.any(String)
        })
      });
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO Events'),
        expect.arrayContaining([
          sampleEvents.validEvent.event_name,
          sampleEvents.validEvent.start_time,
          sampleEvents.validEvent.end_time
        ])
      );
    });

    it('should create event with only required fields', async () => {
      // Arrange
      setupMockSuccess('createEvent');

      // Act
      const response = await request(app)
        .post('/events')
        .send(sampleEvents.minimalEvent)
        .expect(201);

      // Assert
      expect(response.body).toMatchObject({
        message: 'Event created successfully',
        event: expect.objectContaining({
          event_name: expect.any(String)
        })
      });
    });

    it('should return 400 for missing event_name', async () => {
      // Act
      const response = await request(app)
        .post('/events')
        .send(invalidEvents.missingName)
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        message: 'event_name, start_time, and end_time are required'
      });
      expect(mockPool.query).not.toHaveBeenCalled();
    });

    it('should return 400 for missing start_time', async () => {
      // Act
      const response = await request(app)
        .post('/events')
        .send(invalidEvents.missingStartTime)
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        message: 'event_name, start_time, and end_time are required'
      });
    });

    it('should return 400 for missing end_time', async () => {
      // Act
      const response = await request(app)
        .post('/events')
        .send(invalidEvents.missingEndTime)
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        message: 'event_name, start_time, and end_time are required'
      });
    });

    it('should return 400 for invalid time range', async () => {
      // Act
      const response = await request(app)
        .post('/events')
        .send(invalidEvents.endTimeBeforeStartTime)
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        message: 'End time must be later than start time'
      });
    });

    it('should return 400 for same start and end time', async () => {
      // Act
      const response = await request(app)
        .post('/events')
        .send(invalidEvents.sameStartEndTime)
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        message: 'End time must be later than start time'
      });
    });

    it('should handle database errors during creation', async () => {
      // Arrange
      setupMockError('constraintViolation');

      // Act
      const response = await request(app)
        .post('/events')
        .send(sampleEvents.validEvent)
        .expect(500);

      // Assert
      expect(response.body).toMatchObject({
        message: 'Database error',
        error: expect.any(String)
      });
    });

    it('should handle malformed JSON in request body', async () => {
      // Act
      const response = await request(app)
        .post('/events')
        .type('json')
        .send('{"invalid": json}');

      // Assert - Express built-in JSON parsing will handle this with 400 or 500
      expect([400, 500]).toContain(response.status);
    });

    it('should handle missing Content-Type header', async () => {
      // Act
      const response = await request(app)
        .post('/events')
        .send('event_name=Test&start_time=2024-12-01T09:00:00.000Z');

      // Assert - Express may return 400 or 500 depending on parsing
      expect([400, 500]).toContain(response.status);
    });

    it('should handle very long event messages', async () => {
      // Arrange
      setupMockSuccess('createEvent');
      const longEvent = {
        ...sampleEvents.validEvent,
        event_name: 'A'.repeat(1000),
        description: 'B'.repeat(5000)
      };

      // Act
      const response = await request(app)
        .post('/events')
        .send(longEvent)
        .expect(201);

      // Assert
      expect(response.body.message).toBe('Event created successfully');
    });

    it('should handle special characters in event data', async () => {
      // Arrange
      setupMockSuccess('createEvent');

      // Act
      const response = await request(app)
        .post('/events')
        .send(sampleEvents.eventWithSpecialChars)
        .expect(201);

      // Assert
      expect(response.body.message).toBe('Event created successfully');
    });
  });

  describe('PUT /events/:id', () => {
    it('should update an event successfully', async () => {
      // Arrange
      setupMockSuccess('updateEvent');

      // Act
      const response = await request(app)
        .put('/events/1')
        .send(sampleEvents.updateEventData)
        .expect(200);

      // Assert
      expect(response.body).toMatchObject({
        message: 'Event updated successfully',
        event: expect.objectContaining({
          event_id: expect.any(Number)
        })
      });
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE Events'),
        expect.arrayContaining(['1']) // ID should be last parameter
      );
    });

    it('should handle partial updates', async () => {
      // Arrange
      setupMockSuccess('updateEvent');
      const partialUpdate = { event_name: 'Updated Name Only' };

      // Act
      const response = await request(app)
        .put('/events/1')
        .send(partialUpdate)
        .expect(200);

      // Assert
      expect(response.body.message).toBe('Event updated successfully');
    });

    it('should return 404 for non-existent event', async () => {
      // Arrange
      setupMockEmpty();

      // Act
      const response = await request(app)
        .put('/events/999')
        .send(sampleEvents.updateEventData)
        .expect(404);

      // Assert
      expect(response.body).toEqual({
        message: 'Event not found'
      });
    });

    it('should return 400 for invalid time range in update', async () => {
      // Act
      const response = await request(app)
        .put('/events/1')
        .send({
          start_time: '2024-12-01T17:00:00.000Z',
          end_time: '2024-12-01T09:00:00.000Z'
        })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        message: 'End time must be later than start time'
      });
    });

    it('should handle database errors during update', async () => {
      // Arrange
      setupMockError('networkError');

      // Act
      const response = await request(app)
        .put('/events/1')
        .send(sampleEvents.updateEventData)
        .expect(500);

      // Assert
      expect(response.body).toMatchObject({
        message: 'Database error',
        error: expect.any(String)
      });
    });

    it('should allow empty update body', async () => {
      // Arrange
      setupMockSuccess('updateEvent');

      // Act
      const response = await request(app)
        .put('/events/1')
        .send({})
        .expect(200);

      // Assert
      expect(response.body.message).toBe('Event updated successfully');
    });
  });

  describe('DELETE /events/:id', () => {
    it('should delete an event successfully', async () => {
      // Arrange
      setupMockSuccess('deleteEvent');

      // Act
      const response = await request(app)
        .delete('/events/1')
        .expect(200);

      // Assert
      expect(response.body).toMatchObject({
        message: 'Event deleted successfully',
        event: expect.objectContaining({
          event_id: expect.any(Number),
          event_name: expect.any(String)
        })
      });
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM Events WHERE event_id = $1'),
        ['1']
      );
    });

    it('should return 404 for non-existent event', async () => {
      // Arrange
      setupMockEmpty();

      // Act
      const response = await request(app)
        .delete('/events/999')
        .expect(404);

      // Assert
      expect(response.body).toEqual({
        message: 'Event not found'
      });
    });

    it('should handle database errors during deletion', async () => {
      // Arrange
      setupMockError('constraintViolation');

      // Act
      const response = await request(app)
        .delete('/events/1')
        .expect(500);

      // Assert
      expect(response.body).toMatchObject({
        message: 'Database error',
        error: expect.any(String)
      });
    });

    it('should handle invalid event ID for deletion', async () => {
      // Arrange
      setupMockEmpty();

      // Act
      const response = await request(app)
        .delete('/events/invalid-id')
        .expect(404);

      // Assert
      expect(response.body).toEqual({
        message: 'Event not found'
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should return 404 for non-existent routes', async () => {
      // Act
      const response = await request(app)
        .get('/events/invalid/route')
        .expect(404);

      // Assert
      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found')
      });
    });

    it('should handle unsupported HTTP methods', async () => {
      // Act
      const response = await request(app)
        .patch('/events/1'); // PATCH is not implemented

      // Assert
      expect(response.status).toBe(404);
    });

    it('should handle multiple concurrent requests', async () => {
      // Arrange
      setupMockSuccess('getAllEvents');
      const requests = Array.from({ length: 5 }, () => 
        request(app).get('/events')
      );

      // Act
      const responses = await Promise.all(requests);

      // Assert
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
      });
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
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });
  });

  describe('Content Type and Header Handling', () => {
    it('should accept application/json content type', async () => {
      // Arrange
      setupMockSuccess('createEvent');

      // Act
      const response = await request(app)
        .post('/events')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(sampleEvents.validEvent))
        .expect(201);

      // Assert
      expect(response.body.message).toBe('Event created successfully');
    });

    it('should include proper response headers', async () => {
      // Arrange
      setupMockSuccess('getAllEvents');

      // Act
      const response = await request(app)
        .get('/events')
        .expect(200);

      // Assert
      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should handle requests with custom headers', async () => {
      // Arrange
      setupMockSuccess('getAllEvents');

      // Act
      const response = await request(app)
        .get('/events')
        .set('X-Custom-Header', 'test-value')
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
    });
  });
});