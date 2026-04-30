/**
 * Jest setupFiles — runs in the test environment before each test file.
 * Sets global.config so every test can access HOST_URL and credentials.
 */
const profile = process.env.PROFILE || 'stag';
// eslint-disable-next-line import/no-dynamic-require
const config = require('./configs/' + profile);
global.config = config;
