'use strict';

const pactum = require('pactum');
const { BASE_URL } = require('../config/base');
const { ENDPOINTS } = require('../constants/endpoints');

/**
 * Logs in a user and returns the Bearer token.
 * @param {string} email - The user's email address
 * @param {string} password - The user's password
 * @returns {Promise<string>} The JWT token string
 */
const login = async (email, password) => {
  pactum.request.setBaseUrl(BASE_URL);
  const response = await pactum
    .spec()
    .post(ENDPOINTS.AUTH_LOGIN)
    .withJson({ email, password })
    .expectStatus(200)
    .returns('token');
  return response;
};

/**
 * Returns the Authorization header value for a given token.
 * @param {string} token - The JWT token string
 * @returns {string} The formatted Bearer token header value
 */
const bearerHeader = (token) => `Bearer ${token}`;

module.exports = { login, bearerHeader };
