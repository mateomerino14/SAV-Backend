// Test setup file
const { execSync } = require('child_process');

// Global test setup
beforeAll(() => {
  // Setup test database or other global resources
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'file:./test.db';
});

// Global test teardown
afterAll(() => {
  // Cleanup test resources
  
  try {
    execSync('rm -f test.db');
  } catch (error) {
    // Ignore cleanup errors
  }
  
});

// Jest global configuration
jest.setTimeout(10000); // 10 second timeout for all tests
