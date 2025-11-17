// Unit tests for eventController.js
const { mockPool, setupMockSuccess, setupMockError, setupMockEmpty, resetMock } = require('../mocks/database');
const { 
  sampleEvents, 
  invalidEvents, 
  createMockRequest, 
  createMockResponse,
  generateTestEvent
} = require('../helpers/testData');

// Mock the database dependency
jest.mock('../../../../db/db.js', () => mockPool);

const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../../src/controllers/eventController');

describe('Event Controller Unit Tests', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    resetMock();
    
    // Setup fresh mock request and response objects
    mockReq = createMockRequest();
    mockRes = createMockResponse();
  });

  describe('getEvents', () => {
    it('should return all events successfully', async () => {
      // Arrange
      setupMockSuccess('getAllEvents');

      // Act
      await getEvents(mockReq, mockRes);

      // Assert
      expect(mockPool.query).toHaveBeenCalledTimes(1);
      expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
      expect(mockRes.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          event_id: expect.any(Number),
          event_name: expect.any(String),
          start_time: expect.any(String),
          end_time: expect.any(String)
        })
      ]));
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return empty array when no events exist', async () => {
      // Arrange
      setupMockEmpty();

      // Act
      await getEvents(mockReq, mockRes);

      // Assert
      expect(mockPool.query).toHaveBeenCalledTimes(1);
      expect(mockRes.json).toHaveBeenCalledWith([]);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      // Arrange
      setupMockError('databaseConnection');

      // Act
      await getEvents(mockReq, mockRes);

      // Assert
      expect(mockPool.query).toHaveBeenCalledTimes(1);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Database error',
        error: expect.any(String)
      });
    });

    it('should order events by start_time', async () => {
      // Arrange
      setupMockSuccess('getAllEvents');

      // Act
      await getEvents(mockReq, mockRes);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY start_time')
      );
    });
  });

  describe('getEventById', () => {
    it('should return event by ID successfully', async () => {
      // Arrange
      mockReq.params = { id: '1' };
      setupMockSuccess('getEventById');

      // Act
      await getEventById(mockReq, mockRes);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE event_id = $1'),
        ['1']
      );
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        event_id: expect.any(Number),
        event_name: expect.any(String)
      }));
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 404 when event not found', async () => {
      // Arrange
      mockReq.params = { id: '999' };
      setupMockEmpty();

      // Act
      await getEventById(mockReq, mockRes);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE event_id = $1'),
        ['999']
      );
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Event not found'
      });
    });

    it('should handle database errors', async () => {
      // Arrange
      mockReq.params = { id: '1' };
      setupMockError('queryTimeout');

      // Act
      await getEventById(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Database error',
        error: expect.any(String)
      });
    });

    it('should handle non-numeric ID parameters', async () => {
      // Arrange
      mockReq.params = { id: 'invalid' };
      setupMockEmpty();

      // Act
      await getEventById(mockReq, mockRes);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE event_id = $1'),
        ['invalid']
      );
    });
  });

  describe('createEvent', () => {
    it('should create a new event successfully', async () => {
      // Arrange
      mockReq.body = sampleEvents.validEvent;
      setupMockSuccess('createEvent');

      // Act
      await createEvent(mockReq, mockRes);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO Events'),
        [
          sampleEvents.validEvent.event_name,
          sampleEvents.validEvent.start_time,
          sampleEvents.validEvent.end_time,
          sampleEvents.validEvent.location,
          sampleEvents.validEvent.description,
          sampleEvents.validEvent.media_urls,
          sampleEvents.validEvent.event_categories
        ]
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Event created successfully',
        event: expect.objectContaining({
          event_id: expect.any(Number),
          event_name: expect.any(String)
        })
      });
    });

    it('should create event with minimal required fields', async () => {
      // Arrange
      mockReq.body = sampleEvents.minimalEvent;
      setupMockSuccess('createEvent');

      // Act
      await createEvent(mockReq, mockRes);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO Events'),
        [
          sampleEvents.minimalEvent.event_name,
          sampleEvents.minimalEvent.start_time,
          sampleEvents.minimalEvent.end_time,
          null, // location
          null, // description
          null, // media_urls
          null  // event_categories
        ]
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should return 400 if event_name is missing', async () => {
      // Arrange
      mockReq.body = invalidEvents.missingName;

      // Act
      await createEvent(mockReq, mockRes);

      // Assert
      expect(mockPool.query).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'event_name, start_time, and end_time are required'
      });
    });

    it('should return 400 if start_time is missing', async () => {
      // Arrange
      mockReq.body = invalidEvents.missingStartTime;

      // Act
      await createEvent(mockReq, mockRes);

      // Assert
      expect(mockPool.query).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'event_name, start_time, and end_time are required'
      });
    });

    it('should return 400 if end_time is missing', async () => {
      // Arrange
      mockReq.body = invalidEvents.missingEndTime;

      // Act
      await createEvent(mockReq, mockRes);

      // Assert
      expect(mockPool.query).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'event_name, start_time, and end_time are required'
      });
    });

    it('should return 400 if end_time is before start_time', async () => {
      // Arrange
      mockReq.body = invalidEvents.endTimeBeforeStartTime;

      // Act
      await createEvent(mockReq, mockRes);

      // Assert
      expect(mockPool.query).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'End time must be later than start time'
      });
    });

    it('should return 400 if start_time equals end_time', async () => {
      // Arrange
      mockReq.body = invalidEvents.sameStartEndTime;

      // Act
      await createEvent(mockReq, mockRes);

      // Assert
      expect(mockPool.query).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'End time must be later than start time'
      });
    });

    it('should handle database errors during creation', async () => {
      // Arrange
      mockReq.body = sampleEvents.validEvent;
      setupMockError('constraintViolation');

      // Act
      await createEvent(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Database error',
        error: expect.any(String)
      });
    });

    it('should handle null optional fields correctly', async () => {
      // Arrange
      mockReq.body = sampleEvents.eventWithNulls;
      setupMockSuccess('createEvent');

      // Act
      await createEvent(mockReq, mockRes);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO Events'),
        expect.arrayContaining([null, null, null, null])
      );
    });
  });

  describe('updateEvent', () => {
    it('should update an event successfully', async () => {
      // Arrange
      mockReq.params = { id: '1' };
      mockReq.body = sampleEvents.updateEventData;
      setupMockSuccess('updateEvent');

      // Act
      await updateEvent(mockReq, mockRes);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE Events'),
        [
          sampleEvents.updateEventData.event_name,
          sampleEvents.updateEventData.start_time,
          sampleEvents.updateEventData.end_time,
          sampleEvents.updateEventData.location,
          sampleEvents.updateEventData.description,
          sampleEvents.updateEventData.media_urls,
          sampleEvents.updateEventData.event_categories,
          '1'
        ]
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Event updated successfully',
        event: expect.objectContaining({
          event_id: expect.any(Number)
        })
      });
    });

    it('should handle partial updates', async () => {
      // Arrange
      mockReq.params = { id: '1' };
      mockReq.body = sampleEvents.partialUpdateData;
      setupMockSuccess('updateEvent');

      // Act
      await updateEvent(mockReq, mockRes);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE Events'),
        [
          sampleEvents.partialUpdateData.event_name,
          null, // start_time not provided
          null, // end_time not provided
          null, // location not provided
          sampleEvents.partialUpdateData.description,
          null, // media_urls not provided
          null, // event_categories not provided
          '1'
        ]
      );
    });

    it('should return 404 when event to update is not found', async () => {
      // Arrange
      mockReq.params = { id: '999' };
      mockReq.body = sampleEvents.updateEventData;
      setupMockEmpty();

      // Act
      await updateEvent(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Event not found'
      });
    });

    it('should return 400 if updated end_time is before start_time', async () => {
      // Arrange
      mockReq.params = { id: '1' };
      mockReq.body = {
        start_time: '2024-12-01T17:00:00.000Z',
        end_time: '2024-12-01T09:00:00.000Z'
      };

      // Act
      await updateEvent(mockReq, mockRes);

      // Assert
      expect(mockPool.query).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'End time must be later than start time'
      });
    });

    it('should handle database errors during update', async () => {
      // Arrange
      mockReq.params = { id: '1' };
      mockReq.body = sampleEvents.updateEventData;
      setupMockError('networkError');

      // Act
      await updateEvent(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Database error',
        error: expect.any(String)
      });
    });

    it('should allow update without time validation if only one time field is provided', async () => {
      // Arrange
      mockReq.params = { id: '1' };
      mockReq.body = { start_time: '2024-12-01T10:00:00.000Z' }; // Only start_time
      setupMockSuccess('updateEvent');

      // Act
      await updateEvent(mockReq, mockRes);

      // Assert
      expect(mockPool.query).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalledWith(400);
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event successfully', async () => {
      // Arrange
      mockReq.params = { id: '1' };
      setupMockSuccess('deleteEvent');

      // Act
      await deleteEvent(mockReq, mockRes);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM Events WHERE event_id = $1'),
        ['1']
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Event deleted successfully',
        event: expect.objectContaining({
          event_id: expect.any(Number),
          event_name: expect.any(String)
        })
      });
    });

    it('should return 404 when event to delete is not found', async () => {
      // Arrange
      mockReq.params = { id: '999' };
      setupMockEmpty();

      // Act
      await deleteEvent(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Event not found'
      });
    });

    it('should handle database errors during deletion', async () => {
      // Arrange
      mockReq.params = { id: '1' };
      setupMockError('constraintViolation');

      // Act
      await deleteEvent(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Database error',
        error: expect.any(String)
      });
    });

    it('should handle non-numeric ID parameters for deletion', async () => {
      // Arrange
      mockReq.params = { id: 'invalid' };
      setupMockEmpty();

      // Act
      await deleteEvent(mockReq, mockRes);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM Events WHERE event_id = $1'),
        ['invalid']
      );
    });
  });

  describe('Edge Cases and Input Validation', () => {
    it('should handle empty request body in createEvent', async () => {
      // Arrange
      mockReq.body = {};

      // Act
      await createEvent(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'event_name, start_time, and end_time are required'
      });
    });

    it('should handle empty request body in updateEvent', async () => {
      // Arrange
      mockReq.params = { id: '1' };
      mockReq.body = {};
      setupMockSuccess('updateEvent');

      // Act
      await updateEvent(mockReq, mockRes);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE Events'),
        [null, null, null, null, null, null, null, '1']
      );
    });

    it('should handle special characters in event data', async () => {
      // Arrange
      mockReq.body = sampleEvents.eventWithSpecialChars;
      setupMockSuccess('createEvent');

      // Act
      await createEvent(mockReq, mockRes);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO Events'),
        expect.arrayContaining([
          sampleEvents.eventWithSpecialChars.event_name,
          sampleEvents.eventWithSpecialChars.location,
          sampleEvents.eventWithSpecialChars.description
        ])
      );
    });

    it('should handle very long event content', async () => {
      // Arrange
      mockReq.body = sampleEvents.eventWithLongContent;
      setupMockSuccess('createEvent');

      // Act
      await createEvent(mockReq, mockRes);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO Events'),
        expect.arrayContaining([
          sampleEvents.eventWithLongContent.event_name,
          sampleEvents.eventWithLongContent.location,
          sampleEvents.eventWithLongContent.description
        ])
      );
    });
  });
});