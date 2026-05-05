'use strict';

const pactum = require('pactum');
const ENDPOINTS = require('../constants/endpoints');

beforeAll(() => {
  pactum.request.setBaseUrl(global.config.HOST_URL);
});

describe('Health Check', () => {
  it('GET /health should return 200 with status ok', async () => {
    await pactum.spec()
      .get(ENDPOINTS.HEALTH)
      .expectStatus(200)
      .expectJsonLike({
        status: 'ok',
        message: 'Server is running',
      });
  });
});
