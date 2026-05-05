module.exports = {
  testEnvironment: 'node',
  setupFilesAfterFramework: ['./jest.setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 60000,
  reporters: ['default'],
};
