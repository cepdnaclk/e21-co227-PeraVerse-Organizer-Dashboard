// Global test setup configuration
// This file is executed before all tests run

// Set up global test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '5002';

// Global Jest configuration
global.console = {
  ...console,
  // Suppress console.log and console.error during tests unless explicitly needed
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock Date.now for consistent test results
const MOCK_DATE = new Date('2024-11-01T10:00:00.000Z');
global.Date.now = jest.fn(() => MOCK_DATE.getTime());

// Global test utilities
global.testUtils = {
  // Helper to wait for async operations
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Helper to generate consistent test timestamps
  getTestTimestamp: (offsetHours = 0) => {
    const date = new Date(MOCK_DATE);
    date.setHours(date.getHours() + offsetHours);
    return date.toISOString();
  },
  
  // Helper to validate ISO date strings
  isValidISODate: (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && dateString === date.toISOString();
  },
  
  // Helper to check if object has expected event structure
  hasEventStructure: (obj) => {
    const requiredFields = ['event_id', 'event_name', 'start_time', 'end_time'];
    return requiredFields.every(field => obj && obj.hasOwnProperty(field));
  }
};

// Global mock reset
beforeEach(() => {
  // Clear all mock calls and instances
  jest.clearAllMocks();
  
  // Reset console mocks if needed for specific tests
  if (process.env.JEST_VERBOSE === 'true') {
    global.console.log = console.log;
    global.console.error = console.error;
  }
});

// Global test cleanup
afterEach(() => {
  // Cleanup any test artifacts
  jest.restoreAllMocks();
});

// Global error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In test environment, we want to know about unhandled rejections
  throw reason;
});

// Increase default timeout for integration tests
jest.setTimeout(30000);

module.exports = {};