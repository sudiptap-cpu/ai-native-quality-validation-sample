/**
 * @feature @reviews
 * Reviews module API tests — create and retrieve reviews.
 *
 * Setup strategy:
 *   - hostToken: lambdatestadmin@email.com — used for scenario_33 (403 no prior stay)
 *     This user has no pre-seeded confirmed bookings with past checkOut dates,
 *     so the review controller correctly returns 403.
 *
 * Seed data notes:
 *   - Listing 607f1f77bcf86cd799439021 already has 2 seeded reviews, so the
 *     GET reviews test will return a non-empty array.
 *   - Listing 000000000000000000000000 does not exist; the API returns 200 with
 *     an empty array (no listing-level 404 for reviews endpoint).
 */
const pactum = require('pactum');
const { ENDPOINTS } = require('../constants/endpoints');
const { reviewPayloads } = require('../constants/payloads/reviewPayloads');
const { reviewResponses } = require('../constants/responses/reviewResponses');

const SEED_LISTING_WITH_REVIEWS = '607f1f77bcf86cd799439021';
const LISTING_WITH_NO_REVIEWS = '000000000000000000000000';

describe('Reviews API Tests', () => {
  let hostToken;

  beforeAll(async () => {
    // Acquire host token — lambdatestadmin has no prior confirmed stays,
    // making it the correct user for the 403 "no prior stay" assertion
    hostToken = await pactum
      .spec()
      .post(ENDPOINTS.AUTH.LOGIN)
      .withJson({ email: global.config.HOST_EMAIL, password: global.config.HOST_PASSWORD })
      .expectStatus(200)
      .returns('res.body.token');

    console.log('Reviews beforeAll: host token acquired');
  });

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  describe('Review Creation', () => {
    it('Should return 403 when creating a review without a prior confirmed stay @p1 @regression', async () => {
      await pactum
        .spec()
        .post(ENDPOINTS.REVIEWS.BASE)
        .withHeaders({ Authorization: 'Bearer ' + hostToken })
        .withJson(reviewPayloads.CREATE_REVIEW_NO_PRIOR_STAY_PAYLOAD)
        .expectStatus(403)
        .expectJsonLike(reviewResponses.CREATE_REVIEW_NO_PRIOR_STAY_RESPONSE);
    });

    it('Should return 401 when creating a review without auth token @p1 @regression', async () => {
      await pactum
        .spec()
        .post(ENDPOINTS.REVIEWS.BASE)
        .withJson(reviewPayloads.CREATE_REVIEW_UNAUTH_PAYLOAD)
        .expectStatus(401)
        .expectJsonLike(reviewResponses.UNAUTH_ERROR_RESPONSE);
    });
  });

  // ---------------------------------------------------------------------------
  // Retrieve
  // ---------------------------------------------------------------------------

  describe('Review Retrieval', () => {
    it('Should get reviews for a known listing @p0 @sanity @regression', async () => {
      const response = await pactum
        .spec()
        .get(ENDPOINTS.REVIEWS.BY_LISTING(SEED_LISTING_WITH_REVIEWS))
        .expectStatus(200)
        .expectJsonLike(reviewResponses.GET_REVIEWS_FOR_LISTING_RESPONSE)
        .returns('res.body');

      expect(Array.isArray(response.reviews)).toBe(true);
      expect(response.reviews.length).toBeGreaterThan(0);
    });

    it('Should return empty reviews array for listing with no reviews @p1 @regression', async () => {
      const response = await pactum
        .spec()
        .get(ENDPOINTS.REVIEWS.BY_LISTING(LISTING_WITH_NO_REVIEWS))
        .expectStatus(200)
        .expectJsonLike(reviewResponses.GET_REVIEWS_FOR_LISTING_RESPONSE)
        .returns('res.body');

      expect(Array.isArray(response.reviews)).toBe(true);
    });
  });
});
