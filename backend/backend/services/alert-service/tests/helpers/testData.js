// Test data helpers and fixtures for alert service tests

const jwt = require('jsonwebtoken');

// Sample alert data for testing
const sampleAlerts = {
  basic: {
    alert: 'Basic test alert message',
    sent_at: '2025-01-01T10:00:00Z'
  },
  
  emergency: {
    alert: 'EMERGENCY: Immediate evacuation required in Building A - Fire detected',
    sent_at: '2025-01-01T10:30:00Z'
  },
  
  maintenance: {
    alert: 'Scheduled maintenance: Elevator service will be unavailable from 2-4 PM',
    sent_at: '2025-01-01T11:00:00Z'
  },
  
  weather: {
    alert: 'Weather Advisory: Heavy rain expected. All outdoor events moved indoors',
    sent_at: '2025-01-01T12:00:00Z'
  },
  
  longMessage: {
    alert: 'This is a very long alert message that contains multiple sentences and detailed information about an emergency situation that requires immediate attention from all attendees and staff members present at the event venue.',
    sent_at: '2025-01-01T13:00:00Z'
  },
  
  specialChars: {
    alert: 'Alert with special characters: ñáéíóú & symbols! @#$%^&*()_+ 🚨⚠️',
    sent_at: '2025-01-01T14:00:00Z'
  },
  
  minimal: {
    alert: 'OK'
  },
  
  withWhitespace: {
    alert: '  Alert with leading and trailing spaces  '
  }
};

// Sample database responses
const sampleDbResponses = {
  validAlert: {
    alert_id: 1,
    alert: 'Test alert message',
    sent_at: new Date('2025-01-01T10:00:00Z'),
    sent_by: 'test@example.com'
  },
  
  multipleAlerts: [
    {
      alert_id: 1,
      alert: 'First alert message',
      sent_at: new Date('2025-01-01T10:00:00Z'),
      sent_by: 'admin@example.com'
    },
    {
      alert_id: 2, 
      alert: 'Second alert message',
      sent_at: new Date('2025-01-01T11:00:00Z'),
      sent_by: 'manager@example.com'
    }
  ]
};

// JWT token helpers
const tokenHelpers = {
  createValidToken: (payload = { id: 1, username: 'test@example.com' }) => {
    return jwt.sign(payload, 'test-jwt-secret-key', { expiresIn: '1h' });
  },
  
  createExpiredToken: (payload = { id: 1, username: 'test@example.com' }) => {
    return jwt.sign(payload, 'test-jwt-secret-key', { expiresIn: '-1h' });
  },
  
  createInvalidToken: () => {
    return 'invalid.jwt.token';
  },
  
  createTokenWithoutUsername: () => {
    return jwt.sign({ id: 1 }, 'test-jwt-secret-key', { expiresIn: '1h' });
  }
};

// Mock request helpers
const requestHelpers = {
  createMockReq: (body = {}, headers = {}, params = {}) => ({
    body,
    headers,
    params,
    query: {},
    ip: '127.0.0.1',
    method: 'GET',
    url: '/alerts'
  }),
  
  createMockRes: () => {
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
      send: jest.fn(() => res),
      set: jest.fn(() => res),
      cookie: jest.fn(() => res),
      locals: {}
    };
    return res;
  },
  
  createAuthenticatedReq: (body = {}, additionalHeaders = {}) => {
    const token = tokenHelpers.createValidToken();
    return requestHelpers.createMockReq(
      body,
      {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        ...additionalHeaders
      }
    );
  }
};

// Validation helpers
const validationHelpers = {
  isValidAlert: (alert) => {
    return alert &&
           typeof alert.alert_id === 'number' &&
           typeof alert.alert === 'string' &&
           alert.alert.length > 0 &&
           alert.sent_at instanceof Date &&
           typeof alert.sent_by === 'string';
  },
  
  isValidAlertArray: (alerts) => {
    return Array.isArray(alerts) && 
           alerts.every(alert => validationHelpers.isValidAlert(alert));
  }
};

// Error generators
const errorGenerators = {
  databaseError: (message = 'Database connection failed') => {
    const error = new Error(message);
    error.code = 'ECONNREFUSED';
    return error;
  },
  
  validationError: (message = 'Validation failed') => {
    const error = new Error(message);
    error.name = 'ValidationError';
    return error;
  },
  
  authError: (message = 'Authentication failed') => {
    const error = new Error(message);
    error.name = 'AuthenticationError';
    return error;
  }
};

// Performance helpers
const performanceHelpers = {
  measureExecutionTime: async (fn) => {
    const start = process.hrtime.bigint();
    await fn();
    const end = process.hrtime.bigint();
    return Number(end - start) / 1e6; // Convert to milliseconds
  },
  
  createConcurrentRequests: (count, requestFn) => {
    return Array(count).fill(null).map(() => requestFn());
  }
};

module.exports = {
  sampleAlerts,
  sampleDbResponses,
  tokenHelpers,
  requestHelpers,
  validationHelpers,
  errorGenerators,
  performanceHelpers
};