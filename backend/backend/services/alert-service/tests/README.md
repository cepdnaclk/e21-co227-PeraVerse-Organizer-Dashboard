# Alert Service Tests

This directory contains comprehensive test suites for the Alert Service, including unit tests, integration tests, and test utilities.

## Test Structure

```
tests/
├── unit/                 # Unit tests for individual components
│   ├── alertController.test.js    # Tests for alert controller functions
│   └── kioskNotifier.test.js      # Tests for WebSocket notification utility
├── integration/          # Integration tests for API endpoints
│   ├── alertRoutes.test.js        # Tests for alert route handlers
│   └── app.test.js                # Tests for main Express application
├── mocks/                # Mock implementations for dependencies
│   ├── database.js                # Database mock and test data
│   └── websocket.js               # WebSocket mock for kiosk notifications
├── helpers/              # Test utilities and data generators
│   └── testData.js                # Sample data and helper functions
└── setup.js              # Global test setup and configuration
```

## Running Tests

### Prerequisites

Make sure you have the required dependencies installed:

```bash
npm install
```

### Available Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (reruns tests when files change)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- alertController.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="createAlert"

# Run tests for a specific directory
npm test -- tests/unit/
```

## Test Categories

### Unit Tests

Unit tests focus on testing individual functions and components in isolation:

- **Alert Controller Tests**: Test CRUD operations for alerts
- **Kiosk Notifier Tests**: Test WebSocket communication with kiosk displays

### Integration Tests

Integration tests verify that different components work together correctly:

- **Route Tests**: Test HTTP endpoints with real request/response cycles
- **Application Tests**: Test the complete Express application setup

## Test Coverage

The test suite aims for high coverage across:

- **Functions**: All exported functions should be tested
- **Branches**: All conditional logic paths should be covered
- **Lines**: Most lines of code should be executed during tests
- **Statements**: All statements should be tested

Current coverage thresholds:
- Branches: 80%
- Functions: 80% 
- Lines: 80%
- Statements: 80%

## Mock Strategy

### Database Mocking
- Uses Jest mocks to simulate PostgreSQL database responses
- Provides predictable test data and error scenarios
- Avoids dependency on actual database for tests

### WebSocket Mocking
- Mocks WebSocket connections for kiosk notifications
- Simulates various connection states (connected, disconnected, error)
- Tests notification sending without requiring actual WebSocket server

### JWT Token Mocking
- Creates valid and invalid JWT tokens for authentication testing
- Tests various token scenarios (expired, malformed, missing claims)

## Test Data

The test suite includes comprehensive sample data:

- **Basic Alerts**: Simple alert messages for happy path testing
- **Edge Cases**: Long messages, special characters, whitespace handling
- **Error Scenarios**: Invalid data, missing fields, database failures
- **Performance Data**: Large payloads and concurrent request scenarios

## Best Practices

### Writing New Tests

1. **Descriptive Names**: Use clear, descriptive test names that explain what is being tested
2. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification phases
3. **Isolation**: Each test should be independent and not rely on other tests
4. **Cleanup**: Reset mocks and state between tests using `beforeEach` hooks
5. **Edge Cases**: Test both happy paths and error conditions

### Mock Usage

1. **Reset Mocks**: Always reset mocks between tests using `jest.clearAllMocks()`
2. **Specific Assertions**: Use specific matchers like `toHaveBeenCalledWith()` instead of just `toHaveBeenCalled()`
3. **Mock Returns**: Set up mock return values that match the expected data structure
4. **Error Testing**: Mock error scenarios to test error handling

### Performance Testing

1. **Timeouts**: Set appropriate timeouts for async operations
2. **Concurrency**: Test handling of multiple simultaneous requests
3. **Memory**: Monitor memory usage for large payloads
4. **Response Time**: Verify acceptable response times

## Debugging Tests

### Common Issues

1. **Async/Await**: Ensure async operations are properly awaited
2. **Mock Timing**: Make sure mocks are set up before the code under test runs
3. **Module Imports**: Clear module cache when testing modules with side effects
4. **Database Connections**: Ensure database connections are properly mocked

### Debugging Commands

```bash
# Run tests with debug output
npm test -- --verbose

# Run a single test file with debug info  
npm test -- --verbose alertController.test.js

# Run tests and keep process alive for debugging
npm test -- --runInBand --detectOpenHandles
```

## Continuous Integration

These tests are designed to run in CI/CD environments:

- **No External Dependencies**: All external services are mocked
- **Deterministic**: Tests produce consistent results across different environments
- **Fast Execution**: Tests run quickly without waiting for real services
- **Comprehensive Coverage**: High test coverage ensures code quality

## Contributing

When adding new features to the Alert Service:

1. **Add Unit Tests**: Test new functions in isolation
2. **Add Integration Tests**: Test new API endpoints end-to-end
3. **Update Mocks**: Add new mock scenarios if needed
4. **Maintain Coverage**: Ensure coverage thresholds are maintained
5. **Update Documentation**: Update this README if test structure changes