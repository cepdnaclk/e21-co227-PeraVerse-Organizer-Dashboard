// Mock database pool for testing
const mockPool = {
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
};

// Mock successful database responses
const mockAlertData = [
  {
    alert_id: 1,
    alert: 'Test alert message 1',
    sent_at: new Date('2025-01-01T10:00:00Z'),
    sent_by: 'test@example.com'
  },
  {
    alert_id: 2,
    alert: 'Test alert message 2', 
    sent_at: new Date('2025-01-01T11:00:00Z'),
    sent_by: 'admin@example.com'
  }
];

// Helper functions for common mock responses
const mockPoolResponses = {
  getAllAlerts: () => ({
    rows: mockAlertData,
    rowCount: mockAlertData.length
  }),
  
  getAlertById: (id) => ({
    rows: mockAlertData.filter(alert => alert.alert_id === parseInt(id)),
    rowCount: mockAlertData.filter(alert => alert.alert_id === parseInt(id)).length
  }),
  
  createAlert: (alert, sent_by, sent_at) => ({
    rows: [{
      alert_id: Math.floor(Math.random() * 1000) + 100,
      alert: alert,
      sent_at: sent_at || new Date(),
      sent_by: sent_by
    }],
    rowCount: 1
  }),
  
  emptyResponse: () => ({
    rows: [],
    rowCount: 0
  }),
  
  databaseError: () => {
    throw new Error('Database connection failed');
  }
};

module.exports = {
  mockPool,
  mockAlertData,
  mockPoolResponses
};