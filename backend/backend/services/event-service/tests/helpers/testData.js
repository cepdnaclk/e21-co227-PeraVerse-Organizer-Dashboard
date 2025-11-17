// Test data and helper functions for event service testing

// Sample event data for testing
const sampleEvents = {
  // Valid event data
  validEvent: {
    event_name: 'Sample Conference',
    start_time: '2024-12-01T09:00:00.000Z',
    end_time: '2024-12-01T17:00:00.000Z',
    location: 'Convention Center',
    description: 'A sample technology conference',
    media_urls: ['https://example.com/poster.jpg'],
    event_categories: ['technology', 'conference']
  },

  // Minimal valid event data (only required fields)
  minimalEvent: {
    event_name: 'Minimal Event',
    start_time: '2024-12-15T10:00:00.000Z',
    end_time: '2024-12-15T12:00:00.000Z'
  },

  // Event with all optional fields null
  eventWithNulls: {
    event_name: 'Event with Nulls',
    start_time: '2024-12-20T14:00:00.000Z',
    end_time: '2024-12-20T16:00:00.000Z',
    location: null,
    description: null,
    media_urls: null,
    event_categories: null
  },

  // Event with special characters
  eventWithSpecialChars: {
    event_name: 'Special Event: "Quotes" & Symbols!',
    start_time: '2024-12-25T18:00:00.000Z',
    end_time: '2024-12-25T20:00:00.000Z',
    location: 'Café & Bistro',
    description: 'Event with special characters: @#$%^&*()',
    media_urls: ['https://example.com/special-chars.jpg?param=value&other=123'],
    event_categories: ['special', 'chars & symbols']
  },

  // Event with long content
  eventWithLongContent: {
    event_name: 'Very Long Event Name That Exceeds Normal Length Expectations',
    start_time: '2024-12-30T09:00:00.000Z',
    end_time: '2024-12-30T18:00:00.000Z',
    location: 'A very long location name that might test database field limits and application handling',
    description: 'This is a very long description that contains multiple paragraphs and detailed information about the event. '.repeat(10),
    media_urls: Array(5).fill(0).map((_, i) => `https://example.com/media-${i}.jpg`),
    event_categories: ['long-content', 'testing', 'database-limits', 'validation', 'edge-cases']
  },

  // Event update data
  updateEventData: {
    event_name: 'Updated Event Name',
    start_time: '2024-12-01T08:00:00.000Z',
    end_time: '2024-12-01T18:00:00.000Z',
    location: 'Updated Location',
    description: 'Updated description',
    media_urls: ['https://example.com/updated-poster.jpg'],
    event_categories: ['updated', 'modified']
  },

  // Partial update data
  partialUpdateData: {
    event_name: 'Partially Updated Event',
    description: 'Only name and description updated'
  }
};

// Invalid event data for error testing
const invalidEvents = {
  // Missing required fields
  missingName: {
    start_time: '2024-12-01T09:00:00.000Z',
    end_time: '2024-12-01T17:00:00.000Z'
  },

  missingStartTime: {
    event_name: 'Event Missing Start Time',
    end_time: '2024-12-01T17:00:00.000Z'
  },

  missingEndTime: {
    event_name: 'Event Missing End Time',
    start_time: '2024-12-01T09:00:00.000Z'
  },

  // Invalid time relationships
  endTimeBeforeStartTime: {
    event_name: 'Invalid Time Event',
    start_time: '2024-12-01T17:00:00.000Z',
    end_time: '2024-12-01T09:00:00.000Z'
  },

  sameStartEndTime: {
    event_name: 'Same Time Event',
    start_time: '2024-12-01T12:00:00.000Z',
    end_time: '2024-12-01T12:00:00.000Z'
  },

  // Empty or invalid values
  emptyName: {
    event_name: '',
    start_time: '2024-12-01T09:00:00.000Z',
    end_time: '2024-12-01T17:00:00.000Z'
  },

  whitespaceOnlyName: {
    event_name: '   ',
    start_time: '2024-12-01T09:00:00.000Z',
    end_time: '2024-12-01T17:00:00.000Z'
  },

  invalidDateFormat: {
    event_name: 'Invalid Date Event',
    start_time: '2024-13-01T09:00:00.000Z', // Invalid month
    end_time: '2024-12-01T17:00:00.000Z'
  }
};

// Expected database responses
const expectedResponses = {
  successfulCreation: {
    event_id: 1,
    event_name: 'Sample Conference',
    start_time: '2024-12-01T09:00:00.000Z',
    end_time: '2024-12-01T17:00:00.000Z',
    location: 'Convention Center',
    description: 'A sample technology conference',
    media_urls: ['https://example.com/poster.jpg'],
    event_categories: ['technology', 'conference']
  },

  successfulUpdate: {
    event_id: 1,
    event_name: 'Updated Event Name',
    start_time: '2024-12-01T08:00:00.000Z',
    end_time: '2024-12-01T18:00:00.000Z',
    location: 'Updated Location',
    description: 'Updated description',
    media_urls: ['https://example.com/updated-poster.jpg'],
    event_categories: ['updated', 'modified']
  }
};

// Helper functions for creating mock request and response objects
const createMockRequest = (body = {}, params = {}, headers = {}) => ({
  body,
  params,
  headers,
  ...Object.keys(body).reduce((acc, key) => {
    acc[key] = body[key];
    return acc;
  }, {})
});

const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis()
  };
  return res;
};

// Helper function to generate test event with current/future dates
const generateTestEvent = (daysFromNow = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + daysFromNow);
  startDate.setHours(9, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setHours(17, 0, 0, 0);

  return {
    event_name: 'Generated Test Event',
    start_time: startDate.toISOString(),
    end_time: endDate.toISOString(),
    location: 'Test Location',
    description: 'Auto-generated test event',
    media_urls: ['https://example.com/test.jpg'],
    event_categories: ['test', 'generated']
  };
};

// Helper function to create event with invalid time range
const createInvalidTimeEvent = () => ({
  event_name: 'Invalid Time Event',
  start_time: '2024-12-01T17:00:00.000Z',
  end_time: '2024-12-01T09:00:00.000Z' // End before start
});

// Helper function to validate event structure
const validateEventStructure = (event) => {
  const requiredFields = ['event_id', 'event_name', 'start_time', 'end_time'];
  const optionalFields = ['location', 'description', 'media_urls', 'event_categories'];
  
  const hasRequiredFields = requiredFields.every(field => 
    event.hasOwnProperty(field) && event[field] !== undefined
  );
  
  const hasValidStructure = Object.keys(event).every(key =>
    requiredFields.includes(key) || optionalFields.includes(key)
  );

  return { hasRequiredFields, hasValidStructure };
};

// Helper function to generate multiple test events
const generateMultipleEvents = (count = 3) => {
  return Array.from({ length: count }, (_, index) => ({
    event_id: index + 1,
    event_name: `Test Event ${index + 1}`,
    start_time: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
    location: `Location ${index + 1}`,
    description: `Description for test event ${index + 1}`,
    media_urls: [`https://example.com/event-${index + 1}.jpg`],
    event_categories: ['test', `category-${index + 1}`]
  }));
};

module.exports = {
  sampleEvents,
  invalidEvents,
  expectedResponses,
  createMockRequest,
  createMockResponse,
  generateTestEvent,
  createInvalidTimeEvent,
  validateEventStructure,
  generateMultipleEvents
};