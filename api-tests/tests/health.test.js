/**
 * Health check tests for the server.
 * Verifies the /health endpoint responds with the expected status payload.
 */
const pactum = require('pactum');
const { ENDPOINTS } = require('../constants/endpoints');
const { healthResponses } = require('../constants/responses/healthResponses');

describe('Health Check Tests', () => {
  it('Should return 200 from health check endpoint @p0 @sanity @regression', async () => {
    await pactum
      .spec()
      .get(ENDPOINTS.HEALTH)
      .expectStatus(200)
      .expectJsonLike(healthResponses.HEALTH_CHECK_RESPONSE);
  });
});
