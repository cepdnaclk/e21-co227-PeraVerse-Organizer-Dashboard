// Simple smoke test to verify test setup is working correctly
describe('Test Setup Verification', () => {
  it('should have Jest configured correctly', () => {
    expect(jest).toBeDefined();
    expect(typeof jest.fn).toBe('function');
  });

  it('should have test environment variables set', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.JWT_SECRET).toBe('test-jwt-secret-key');
  });

  it('should be able to import test helpers', () => {
    const { sampleAlerts, tokenHelpers } = require('./helpers/testData');
    
    expect(sampleAlerts).toBeDefined();
    expect(tokenHelpers).toBeDefined();
    expect(typeof tokenHelpers.createValidToken).toBe('function');
  });

  it('should have mocks available', () => {
    const { mockPool } = require('./mocks/database');
    const { mockWS } = require('./mocks/websocket');
    
    expect(mockPool).toBeDefined();
    expect(mockWS).toBeDefined();
    expect(typeof mockPool.query).toBe('function');
    expect(typeof mockWS.send).toBe('function');
  });

  it('should handle async operations', async () => {
    const asyncOperation = async () => {
      return new Promise(resolve => {
        setTimeout(() => resolve('success'), 10);
      });
    };

    const result = await asyncOperation();
    expect(result).toBe('success');
  });

  it('should clear mocks between tests', () => {
    const mockFn = jest.fn();
    mockFn('test');
    expect(mockFn).toHaveBeenCalledWith('test');
    
    // This should be cleared by the beforeEach in other test files
    jest.clearAllMocks();
    expect(mockFn).not.toHaveBeenCalled();
  });
});