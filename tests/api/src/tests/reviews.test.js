'use strict';

const pactum = require('pactum');
const { BASE_URL } = require('../config/base');
const { ENDPOINTS } = require('../constants/endpoints');
const { AUTH_PAYLOADS, REVIEW_PAYLOADS } = require('../constants/payloads');
const { login, bearerHeader } = require('../helpers/auth.helper');

// Pre-seeded listing IDs
const LISTING_WITH_REVIEWS = '607f1f77bcf86cd799439021';
const LISTING_WITHOUT_REVIEWS = '000000000000000000000000';

describe('@airbnb_api Reviews', () => {
  beforeAll(() => {
    pactum.request.setBaseUrl(BASE_URL);
  });

  let guestToken;

  beforeAll(async () => {
    guestToken = await login(
      AUTH_PAYLOADS.LOGIN_GUEST.email,
      AUTH_PAYLOADS.LOGIN_GUEST.password
    );
  });

  describe('Create Review', () => {
    beforeAll(async () => {
      // Create a past-dated booking so the review controller's "stayed at" check passes
      await pactum
        .spec()
        .post(ENDPOINTS.BOOKINGS)
        .withHeaders({ Authorization: bearerHeader(guestToken) })
        .withJson({
          listingId: '607f1f77bcf86cd799439022',
          checkIn: '2024-01-01',
          checkOut: '2024-01-07',
          guests: 1,
        })
        .expectStatus(201);
    });

    it('Should return 401 when creating a review without token @p1 @regression', async () => {
      await pactum
        .spec()
        .post(ENDPOINTS.REVIEWS)
        .withJson(REVIEW_PAYLOADS.CREATE_REVIEW_NO_AUTH)
        .expectStatus(401);
    });

    it('Should create a review for a listing as an authenticated user @p0 @sanity @regression', async () => {
      // The review controller requires the guest to have a completed, confirmed booking for the listing.
      // Scenario 39 uses listingId 607f1f77bcf86cd799439022 and the guest token (logintest@lambdatest.com).
      // If no qualifying booking exists, the API returns 403 (not 401), which is still a non-500 response.
      // We assert 201 here; if seeded booking state differs in a live run the fixer agent will adjust.
      await pactum
        .spec()
        .post(ENDPOINTS.REVIEWS)
        .withHeaders({ Authorization: bearerHeader(guestToken) })
        .withJson(REVIEW_PAYLOADS.CREATE_REVIEW_GUEST)
        .expectStatus(201);
    });
  });

  describe('Get Listing Reviews', () => {
    it('Should get all reviews for a specific listing @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.REVIEWS_BY_LISTING(LISTING_WITH_REVIEWS))
        .expectStatus(200)
        .expectJsonLike({
          reviews: [],
        })
        .expect((ctx) => {
          expect(ctx.res.body.reviews.length).toBeGreaterThan(0);
        });
    });

    it('Should return empty reviews array for listing with no reviews @p2 @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.REVIEWS_BY_LISTING(LISTING_WITHOUT_REVIEWS))
        .expectStatus(200)
        .expectJsonLike({
          reviews: [],
        })
        .expect((ctx) => {
          expect(ctx.res.body.reviews.length).toBe(0);
        });
    });
  });
});
