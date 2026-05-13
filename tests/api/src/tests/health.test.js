'use strict';

const pactum = require('pactum');
const { BASE_URL } = require('../config/base');
const { ENDPOINTS } = require('../constants/endpoints');

describe('@airbnb_api Health', () => {
  beforeAll(() => {
    pactum.request.setBaseUrl(BASE_URL);
  });

  it('Should return server health status @p0 @sanity @regression', async () => {
    await pactum
      .spec()
      .get(ENDPOINTS.HEALTH)
      .expectStatus(200)
      .expectJsonLike({ status: 'ok', message: 'Server is running' });
  });
});
