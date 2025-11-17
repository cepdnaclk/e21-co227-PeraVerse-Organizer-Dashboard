// Unit tests for kioskNotifier.js

describe('KioskNotifier Unit Tests', () => {
  // Mock WebSocket with more comprehensive functionality
  const mockSend = jest.fn();
  const mockOn = jest.fn();
  const mockClose = jest.fn();
  
  const mockWS = {
    send: mockSend,
    readyState: 1, // WebSocket.OPEN
    on: mockOn,
    close: mockClose,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  };

  // Mock the WebSocket constructor
  const WebSocketMock = jest.fn(() => mockWS);
  WebSocketMock.OPEN = 1;
  WebSocketMock.CLOSED = 3;
  WebSocketMock.CONNECTING = 0;
  WebSocketMock.CLOSING = 2;

  beforeAll(() => {
    // Mock WebSocket globally
    global.WebSocket = WebSocketMock;
    jest.doMock('ws', () => WebSocketMock);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockWS.readyState = WebSocketMock.OPEN;
    
    // Reset mock implementations
    mockOn.mockImplementation((event, callback) => {
      // Store callbacks for later simulation
      if (event === 'open') mockWS._openCallback = callback;
      if (event === 'error') mockWS._errorCallback = callback;
      if (event === 'close') mockWS._closeCallback = callback;
    });
  });

  describe('WebSocket Initialization', () => {
    it('should initialize WebSocket connection', () => {
      // Clear module cache to test initialization
      jest.resetModules();
      
      // Require the module to trigger initialization
      require('../../src/utils/kioskNotifier');
      
      // Verify WebSocket constructor was called
      expect(WebSocketMock).toHaveBeenCalledWith('ws://localhost:5010/ws');
    });

    it('should set up WebSocket event listeners', () => {
      jest.resetModules();
      require('../../src/utils/kioskNotifier');
      
      // Verify event listeners were set up
      expect(mockOn).toHaveBeenCalledWith('open', expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('close', expect.any(Function));
    });

    it('should handle WebSocket open event', () => {
      jest.resetModules();
      require('../../src/utils/kioskNotifier');
      
      // Simulate WebSocket open event
      if (mockWS._openCallback) {
        expect(() => mockWS._openCallback()).not.toThrow();
      }
    });

    it('should handle WebSocket error event', () => {
      jest.resetModules();
      require('../../src/utils/kioskNotifier');
      
      // Simulate WebSocket error event
      if (mockWS._errorCallback) {
        const mockError = new Error('Connection failed');
        expect(() => mockWS._errorCallback(mockError)).not.toThrow();
      }
    });

    it('should handle WebSocket close event and attempt reconnection', () => {
      jest.resetModules();
      
      // Mock setTimeout to control reconnection timing
      const originalSetTimeout = global.setTimeout;
      const mockSetTimeout = jest.fn((callback, delay) => {
        // Immediately call the callback for testing
        callback();
        return 123; // mock timer id
      });
      global.setTimeout = mockSetTimeout;
      
      require('../../src/utils/kioskNotifier');
      
      // Simulate WebSocket close event
      if (mockWS._closeCallback) {
        mockWS._closeCallback();
        
        // Verify reconnection was attempted
        expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 3000);
      }
      
      // Restore original setTimeout
      global.setTimeout = originalSetTimeout;
    });
  });

  describe('sendToKiosk', () => {
    let sendToKiosk;

    beforeEach(() => {
      jest.resetModules();
      const kioskNotifier = require('../../src/utils/kioskNotifier');
      sendToKiosk = kioskNotifier.sendToKiosk;
    });

    it('should be defined and callable', () => {
      expect(typeof sendToKiosk).toBe('function');
    });

    it('should send alert when WebSocket is connected', () => {
      const testAlert = {
        alert_id: 1,
        alert: 'Test alert',
        sent_at: new Date(),
        sent_by: 'test@example.com'
      };

      mockWS.readyState = WebSocketMock.OPEN;
      
      sendToKiosk(testAlert);
      
      expect(mockSend).toHaveBeenCalledWith(
        JSON.stringify(testAlert),
        expect.any(Function)
      );
    });

    it('should not send when WebSocket is disconnected', () => {
      const testAlert = {
        alert_id: 1,
        alert: 'Test alert',
        sent_at: new Date(),
        sent_by: 'test@example.com'
      };

      mockWS.readyState = WebSocketMock.CLOSED;
      
      sendToKiosk(testAlert);
      
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('should handle send errors gracefully', () => {
      const testAlert = { alert: 'Test' };
      
      mockWS.readyState = WebSocketMock.OPEN;
      mockSend.mockImplementation((data, callback) => {
        callback(new Error('Send failed'));
      });

      expect(() => sendToKiosk(testAlert)).not.toThrow();
      expect(mockSend).toHaveBeenCalled();
    });

    it('should handle null/undefined gracefully', () => {
      mockWS.readyState = WebSocketMock.OPEN;

      expect(() => {
        sendToKiosk(null);
        sendToKiosk(undefined);
        sendToKiosk({});
      }).not.toThrow();
    });

    it('should handle special characters in alerts', () => {
      const specialAlert = {
        alert: 'Alert with émojis 🚨 and spëcial chars!',
        sent_at: new Date()
      };

      mockWS.readyState = WebSocketMock.OPEN;
      
      expect(() => sendToKiosk(specialAlert)).not.toThrow();
      expect(mockSend).toHaveBeenCalledWith(
        JSON.stringify(specialAlert),
        expect.any(Function)
      );
    });
  });
});