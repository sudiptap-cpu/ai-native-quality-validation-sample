'use strict';

module.exports = async function globalSetup() {
  global.config = {
    HOST_URL: 'http://localhost:5000',
    profile: 'stag',
  };
};
