// Mock implementation for PostgreSQL database operations

// Mock pool object with query method
const mockPool = {
  query: jest.fn()
};

// Predefined mock responses for different scenarios
const mockPoolResponses = {
  // Successful responses
  getAllEvents: {
    rows: [
      {
        event_id: 1,
        event_name: 'Tech Conference 2024',
        start_time: '2024-12-01T09:00:00.000Z',
        end_time: '2024-12-01T17:00:00.000Z',
        location: 'Convention Center',
        description: 'Annual technology conference',
        media_urls: null,
        event_categories: ['technology', 'conference']
      },
      {
        event_id: 2,
        event_name: 'Music Festival',
        start_time: '2024-12-15T18:00:00.000Z',
        end_time: '2024-12-15T23:00:00.000Z',
        location: 'Central Park',
        description: 'Live music performances',
        media_urls: ['https://example.com/poster.jpg'],
        event_categories: ['music', 'festival']
      }
    ]
  },

  getEventById: {
    rows: [
      {
        event_id: 1,
        event_name: 'Tech Conference 2024',
        start_time: '2024-12-01T09:00:00.000Z',
        end_time: '2024-12-01T17:00:00.000Z',
        location: 'Convention Center',
        description: 'Annual technology conference',
        media_urls: null,
        event_categories: ['technology', 'conference']
      }
    ]
  },

  createEvent: {
    rows: [
      {
        event_id: 3,
        event_name: 'Workshop Series',
        start_time: '2024-12-20T10:00:00.000Z',
        end_time: '2024-12-20T16:00:00.000Z',
        location: 'Learning Center',
        description: 'Educational workshop series',
        media_urls: null,
        event_categories: ['workshop', 'education']
      }
    ]
  },

  updateEvent: {
    rows: [
      {
        event_id: 1,
        event_name: 'Updated Tech Conference 2024',
        start_time: '2024-12-01T08:30:00.000Z',
        end_time: '2024-12-01T17:30:00.000Z',
        location: 'Updated Convention Center',
        description: 'Updated annual technology conference',
        media_urls: ['https://example.com/updated-poster.jpg'],
        event_categories: ['technology', 'conference', 'updated']
      }
    ]
  },

  deleteEvent: {
    rows: [
      {
        event_id: 1,
        event_name: 'Tech Conference 2024',
        start_time: '2024-12-01T09:00:00.000Z',
        end_time: '2024-12-01T17:00:00.000Z',
        location: 'Convention Center'
      }
    ]
  },

  // Empty responses
  noEvents: {
    rows: []
  },

  eventNotFound: {
    rows: []
  }
};

// Mock error scenarios
const mockErrors = {
  databaseConnection: new Error('Database connection failed'),
  queryTimeout: new Error('Query timeout'),
  invalidQuery: new Error('Invalid SQL query'),
  constraintViolation: new Error('Database constraint violation'),
  networkError: new Error('Network connection error')
};

// Helper functions to set up specific mock behaviors
const setupMockSuccess = (responseKey) => {
  mockPool.query.mockResolvedValue(mockPoolResponses[responseKey]);
};

const setupMockError = (errorKey) => {
  mockPool.query.mockRejectedValue(mockErrors[errorKey]);
};

const setupMockEmpty = () => {
  mockPool.query.mockResolvedValue(mockPoolResponses.noEvents);
};

// Reset mock to clear all previous calls and behaviors
const resetMock = () => {
  mockPool.query.mockReset();
};

module.exports = {
  mockPool,
  mockPoolResponses,
  mockErrors,
  setupMockSuccess,
  setupMockError,
  setupMockEmpty,
  resetMock
};