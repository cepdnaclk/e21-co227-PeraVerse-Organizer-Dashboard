# Event Service Tests

This directory contains comprehensive test suites for the Event Service, including unit tests, integration tests, and test utilities.

## Test Structure

```
tests/
├── unit/                 # Unit tests for individual components
│   └── eventController.test.js    # Tests for event controller functions
├── integration/          # Integration tests for API endpoints
│   ├── eventRoutes.test.js        # Tests for event route handlers
│   └── app.test.js                # Tests for main Express application
├── mocks/                # Mock implementations for dependencies
│   └── database.js                # Database mock and test data
├── helpers/              # Test utilities and data generators
│   └── testData.js                # Sample data and helper functions
├── setup.js              # Global test setup and configuration
└── smoke.test.js         # Basic environment and framework validation tests
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

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only smoke tests (environment validation)
npm run test:smoke

# Run specific test file
npm test -- eventController.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="createEvent"

# Run tests for a specific directory
npm test -- tests/unit/
```

## Test Categories

### Unit Tests (tests/unit/)

Unit tests focus on testing individual functions and components in isolation:

- **Event Controller Tests**: Test CRUD operations (Create, Read, Update, Delete) for events
  - Input validation and sanitization
  - Database interaction handling
  - Error response formatting
  - Edge cases and boundary conditions

### Integration Tests (tests/integration/)

Integration tests verify that different components work together correctly:

- **Route Tests**: Test HTTP endpoints with real request/response cycles
- **Application Tests**: Test the complete Express application setup including middleware, CORS, and error handling

### Smoke Tests (tests/smoke.test.js)

Basic tests to ensure the testing environment is properly configured:
- Jest framework validation
- Mock availability and functionality
- Test utilities verification
- Environment variable validation

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
- Includes comprehensive mock responses for all CRUD operations
- Supports various error conditions (connection failures, query timeouts, constraint violations)

### Request/Response Mocking
- Creates mock Express request and response objects
- Supports testing of middleware functionality
- Enables testing of HTTP status codes and response formats

## Test Data

The test suite includes comprehensive sample data:

### Valid Event Data
- **Complete Events**: Events with all optional fields populated
- **Minimal Events**: Events with only required fields (event_name, start_time, end_time)
- **Special Characters**: Events with Unicode, symbols, and special formatting
- **Large Content**: Events with extensive descriptions and multiple media URLs

### Invalid Event Data
- **Missing Required Fields**: Various combinations of missing required data
- **Invalid Time Relationships**: End times before start times, equal times
- **Malformed Data**: Empty strings, whitespace-only content, invalid dates

### Edge Cases
- **Boundary Conditions**: Very long content, maximum field lengths
- **Performance Data**: Large payloads for performance testing
- **Concurrent Scenarios**: Multiple simultaneous operations

## Best Practices

### Writing New Tests

1. **Descriptive Names**: Use clear, descriptive test names that explain what is being tested
   ```javascript
   it('should return 400 when event_name is missing', async () => {
   ```

2. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification phases
   ```javascript
   // Arrange
   mockReq.body = invalidEvents.missingName;
   
   // Act
   await createEvent(mockReq, mockRes);
   
   // Assert
   expect(mockRes.status).toHaveBeenCalledWith(400);
   ```

3. **Test Isolation**: Each test should be independent and not rely on other tests
4. **Comprehensive Coverage**: Test both happy paths and error conditions
5. **Mock Management**: Reset mocks between tests using `beforeEach` hooks

### Mock Usage

1. **Reset Mocks**: Always reset mocks between tests using `jest.clearAllMocks()`
2. **Specific Assertions**: Use specific matchers like `toHaveBeenCalledWith()` instead of just `toHaveBeenCalled()`
3. **Mock Returns**: Set up mock return values that match the expected data structure
4. **Error Testing**: Mock error scenarios to test error handling code paths

## Event Service API Testing

### CRUD Operations Covered

1. **CREATE (POST /events)**
   - Valid event creation with all fields
   - Minimal event creation (required fields only)
   - Validation of required fields (event_name, start_time, end_time)
   - Time relationship validation (end_time > start_time)
   - Database error handling

2. **READ (GET /events, GET /events/:id)**
   - Retrieve all events with proper ordering
   - Retrieve single event by ID
   - Handle non-existent event IDs (404 responses)
   - Database error handling
   - Empty result set handling

3. **UPDATE (PUT /events/:id)**
   - Complete event updates
   - Partial event updates (selective field updates)
   - Time validation for updated fields
   - Non-existent event handling
   - Database error scenarios

4. **DELETE (DELETE /events/:id)**
   - Successful event deletion
   - Non-existent event handling
   - Database constraint violation handling
   - Return deleted event information

### Error Scenarios Tested

- **400 Bad Request**: Missing required fields, invalid time relationships
- **404 Not Found**: Non-existent event IDs, invalid routes
- **500 Internal Server Error**: Database connection failures, query timeouts

### Performance Testing

- **Concurrent Requests**: Multiple simultaneous API calls
- **Large Payloads**: Events with extensive content and media
- **Response Time**: Validation of acceptable response times
- **Memory Usage**: Handling of large datasets

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
npm test -- --verbose eventController.test.js

# Run tests and keep process alive for debugging
npm test -- --runInBand --detectOpenHandles

# Run specific test with pattern matching
npm test -- --testNamePattern="should create.*event"
```

## Continuous Integration

These tests are designed to run in CI/CD environments:

- **No External Dependencies**: All external services (database, etc.) are mocked
- **Deterministic**: Tests produce consistent results across different environments
- **Fast Execution**: Tests run quickly without waiting for real services
- **Comprehensive Coverage**: High test coverage ensures code quality
- **Environment Agnostic**: Tests work across different operating systems and Node.js versions

## Contributing

When adding new features to the Event Service:

1. **Add Unit Tests**: Test new functions in isolation
2. **Add Integration Tests**: Test new API endpoints end-to-end
3. **Update Mocks**: Add new mock scenarios if needed for new functionality
4. **Maintain Coverage**: Ensure coverage thresholds are maintained or improved
5. **Update Documentation**: Update this README if test structure changes

## Test Results

Expected test suite results:
- **Total Tests**: ~70+ comprehensive test cases
- **Test Suites**: 4 test files (unit, integration, app, smoke)
- **Coverage**: 80%+ across all metrics
- **Execution Time**: Under 30 seconds for full suite
- **Success Rate**: 100% pass rate for properly configured environment