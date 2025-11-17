// Mock WebSocket for testing kiosk notifications
const WebSocket = jest.fn();

// Mock WebSocket states
WebSocket.CONNECTING = 0;
WebSocket.OPEN = 1;
WebSocket.CLOSING = 2;
WebSocket.CLOSED = 3;

// Mock WebSocket instance
const mockWS = {
  readyState: WebSocket.OPEN,
  send: jest.fn(),
  close: jest.fn(),
  on: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
};

// Mock WebSocket constructor
WebSocket.mockImplementation(() => mockWS);

// Helper to simulate WebSocket connection states
const mockWebSocketStates = {
  connected: () => {
    mockWS.readyState = WebSocket.OPEN;
  },
  
  disconnected: () => {
    mockWS.readyState = WebSocket.CLOSED;
  },
  
  connecting: () => {
    mockWS.readyState = WebSocket.CONNECTING;
  },
  
  simulateError: (callback) => {
    const errorEvent = new Error('WebSocket connection failed');
    callback(errorEvent);
  },
  
  simulateOpen: (callback) => {
    callback();
  },
  
  simulateClose: (callback) => {
    callback();
  }
};

module.exports = {
  WebSocket,
  mockWS,
  mockWebSocketStates
};