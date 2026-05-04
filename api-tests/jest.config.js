'use strict';

module.exports = {
  testEnvironment: 'node',
  globalSetup: './setup/global-setup.js',
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 30000,
  maxWorkers: 1,
  reporters: ['default'],
};
