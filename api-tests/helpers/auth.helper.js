'use strict';

const pactum = require('pactum');
const ENDPOINTS = require('../constants/endpoints');

/**
 * Login with email/password and return a Bearer token string.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<string>} Bearer token
 */
async function login(email, password) {
  const response = await pactum.spec()
    .post(ENDPOINTS.AUTH_LOGIN)
    .withJson({ email, password })
    .expectStatus(200)
    .returns('token');

  return response;
}

module.exports = { login };
