'use strict';

const pactum = require('pactum');
const ENDPOINTS = require('../constants/endpoints');
const PAYLOADS = require('../constants/payloads');
const { KNOWN_IDS, EXPECTED_ERRORS } = require('../constants/responses');
const { login } = require('../helpers/auth.helper');

beforeAll(() => {
  pactum.request.setBaseUrl(global.config.HOST_URL);
});

describe('Reviews - Get listing reviews', () => {
  it('GET /api/reviews/listing/:listingId → 200 with reviews', async () => {
    // Listing 607f1f77bcf86cd799439021 has reviews in mock data
    await pactum.spec()
      .get(ENDPOINTS.REVIEWS_BY_LISTING(KNOWN_IDS.MALIBU_VILLA_ID))
      .expectStatus(200)
      .expect((ctx) => {
        const body = ctx.res.body;
        expect(Array.isArray(body.reviews)).toBe(true);
        expect(body.reviews.length).toBeGreaterThan(0);
        expect(typeof body.reviews[0].rating).toBe('number');
        expect(typeof body.reviews[0].userId._id).toBe('string');
      });
  });

  it('GET /api/reviews/listing/:listingId → 200 with empty reviews for listing with none', async () => {
    // Listing 607f1f77bcf86cd799439028 (Desert Oasis in Scottsdale) has no reviews in mockData.ts
    await pactum.spec()
      .get(ENDPOINTS.REVIEWS_BY_LISTING(KNOWN_IDS.SCOTTSDALE_VILLA_ID))
      .expectStatus(200)
      .expect((ctx) => {
        const body = ctx.res.body;
        expect(Array.isArray(body.reviews)).toBe(true);
        expect(body.reviews.length).toBe(0);
      });
  });
});

describe('Reviews - Create', () => {
  let testUserToken;
  let emmaDavisToken;

  beforeAll(async () => {
    testUserToken = await login(
      PAYLOADS.auth.loginTestUser.email,
      PAYLOADS.auth.loginTestUser.password
    );
    emmaDavisToken = await login(
      PAYLOADS.auth.loginEmmaDavis.email,
      PAYLOADS.auth.loginEmmaDavis.password
    );
  });

  it('POST /api/reviews → 401 without auth', async () => {
    await pactum.spec()
      .post(ENDPOINTS.REVIEWS)
      .withJson(PAYLOADS.reviews.createReview)
      .expectStatus(401);
  });

  it('POST /api/reviews → 403 when user has no confirmed past booking', async () => {
    // scenario_44: testuser@lambdatest.com has no confirmed past booking for listing 607f1f77bcf86cd799439021
    // (testuser's booking for 2027-07-01 was created then cancelled in bookings.test.js,
    // and even if confirmed it is not past. testuser has no past confirmed bookings for this listing)
    await pactum.spec()
      .post(ENDPOINTS.REVIEWS)
      .withHeaders('Authorization', `Bearer ${testUserToken}`)
      .withJson(PAYLOADS.reviews.createReview)
      .expectStatus(403)
      .expect((ctx) => {
        expect(ctx.res.body.error).toBe(EXPECTED_ERRORS.REVIEW_ELIGIBILITY);
      });
  });

  it('POST /api/reviews → 400 when user already reviewed listing', async () => {
    // scenario_45: emma.davis@email.com (_id: 507f1f77bcf86cd799439013) has:
    // - A confirmed booking 707f1f77bcf86cd799439031 for listing 607f1f77bcf86cd799439021
    //   with checkOut 2024-11-20 (past date relative to today 2026-05-04)
    // - An existing review 807f1f77bcf86cd799439041 for listing 607f1f77bcf86cd799439021
    // So posting another review should return 400 duplicate error
    await pactum.spec()
      .post(ENDPOINTS.REVIEWS)
      .withHeaders('Authorization', `Bearer ${emmaDavisToken}`)
      .withJson(PAYLOADS.reviews.createReview)
      .expectStatus(400)
      .expect((ctx) => {
        expect(ctx.res.body.error).toBe(EXPECTED_ERRORS.ALREADY_REVIEWED);
      });
  });
});
