/**
 * Test suite: Maximum Guests Limit — Bookings Module
 *
 * Feature tag: @max_guests_limit
 * Profile: stag
 * Traceability: https://github.com/sudiptap-cpu/ai-native-quality-validation-sample/pull/3
 *
 * NOTE — Scenario 5 (exactly 16 guests) is intentionally omitted.
 * No listing in the mock data set has maxGuests >= 16 (the highest is 14 for
 * listing 607f1f77bcf86cd799439046). A request for 16 guests would be rejected
 * by the listing-capacity guard rather than the absolute-limit guard, producing
 * a different error message. This scenario is already covered directionally by
 * scenario_1 (guests=17), which verifies the absolute-limit path.
 */

'use strict';

const pactum = require('pactum');
const { bookingsPayload } = require('../../constants/payload/bookingsPayload');
const { bookingsResponses } = require('../../constants/response/bookingsResponse');

const BOOKINGS_ENDPOINT = '/api/bookings';
const AUTH_ENDPOINT = '/api/auth/login';

describe('Bookings — Maximum Guests Limit Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Load config set by jest globalSetup and configure pactum base URL.
    pactum.request.setBaseUrl(global.config.HOST_URL);

    // Authenticate once and store the bearer token for all protected requests.
    const loginResponse = await pactum
      .spec()
      .post(AUTH_ENDPOINT)
      .withJson({
        email: global.config.CREDENTIALS.email,
        password: global.config.CREDENTIALS.password,
      })
      .expectStatus(200)
      .returns('res.body');

    authToken = `Bearer ${loginResponse.token}`;
  });

  describe('Reject bookings that exceed absolute guest limit (>16)', () => {
    it('Should reject booking when guests count is 17 (one above absolute limit) @p0 @sanity @regression @max_guests_limit', async () => {
      await pactum
        .spec()
        .post(BOOKINGS_ENDPOINT)
        .withHeaders({ Authorization: authToken })
        .withJson(bookingsPayload.CREATE_BOOKING_17_GUESTS)
        .expectStatus(400)
        .expectJsonLike(bookingsResponses.MAX_GUESTS_EXCEEDED_RESPONSE);
    });

    it('Should reject booking when guests count is 20 (well above absolute limit) @p1 @regression @max_guests_limit', async () => {
      await pactum
        .spec()
        .post(BOOKINGS_ENDPOINT)
        .withHeaders({ Authorization: authToken })
        .withJson(bookingsPayload.CREATE_BOOKING_20_GUESTS)
        .expectStatus(400)
        .expectJsonLike(bookingsResponses.MAX_GUESTS_EXCEEDED_RESPONSE);
    });
  });

  describe('Accept bookings within guest limit', () => {
    it('Should create booking successfully with 1 guest (minimum valid guests) @p0 @sanity @regression @max_guests_limit', async () => {
      await pactum
        .spec()
        .post(BOOKINGS_ENDPOINT)
        .withHeaders({ Authorization: authToken })
        .withJson(bookingsPayload.CREATE_BOOKING_1_GUEST)
        .expectStatus(201)
        .expectJsonLike(bookingsResponses.BOOKING_CREATED_1_GUEST_RESPONSE);
    });
  });

  describe('Reject bookings without authentication', () => {
    it('Should reject booking creation when no Authorization token is provided @p0 @sanity @regression @max_guests_limit', async () => {
      const response = await pactum
        .spec()
        .post(BOOKINGS_ENDPOINT)
        .withJson(bookingsPayload.CREATE_BOOKING_NO_AUTH)
        .expectStatus(401);

      expect(response.json.error).toBeDefined();
      expect(typeof response.json.error).toBe('string');
    });
  });
});
