/**
 * @feature @listings
 * Listings module API tests — CRUD, filtering, availability.
 *
 * Setup strategy:
 *   - hostToken: lambdatestadmin@email.com — used for create/update/delete tests
 *   - listingOwnerToken: abhishekkumar@lambdatest.com — owns seed listing 607f1f77bcf86cd799439021
 *   - guestToken: testuser@lambdatest.com — used for non-owner 403 tests
 *   - createdListingId: fresh listing created in beforeAll; used for scenarios 19 and 22
 */
const pactum = require('pactum');
const { ENDPOINTS } = require('../constants/endpoints');
const { listingPayloads } = require('../constants/payloads/listingPayloads');
const { listingResponses } = require('../constants/responses/listingResponses');

const SEED_LISTING_ID = '607f1f77bcf86cd799439021';
const NON_EXISTENT_LISTING_ID = '000000000000000000000000';

describe('Listings API Tests', () => {
  let hostToken;
  let guestToken;
  let createdListingId;

  beforeAll(async () => {
    // Acquire host token (lambdatestadmin) for create/update/delete flows
    hostToken = await pactum
      .spec()
      .post(ENDPOINTS.AUTH.LOGIN)
      .withJson({ email: global.config.HOST_EMAIL, password: global.config.HOST_PASSWORD })
      .expectStatus(200)
      .returns('res.body.token');

    // Acquire guest token for non-owner 403 tests
    guestToken = await pactum
      .spec()
      .post(ENDPOINTS.AUTH.LOGIN)
      .withJson({ email: global.config.GUEST_EMAIL, password: global.config.GUEST_PASSWORD })
      .expectStatus(200)
      .returns('res.body.token');

    // Create a fresh listing owned by hostToken (lambdatestadmin) for update/delete tests
    createdListingId = await pactum
      .spec()
      .post(ENDPOINTS.LISTINGS.BASE)
      .withHeaders({ Authorization: 'Bearer ' + hostToken })
      .withJson(listingPayloads.buildCreateListingPayload())
      .expectStatus(201)
      .returns('res.body.listing._id');

    console.log(`Listings beforeAll: created listing ID = ${createdListingId}`);
  });

  // ---------------------------------------------------------------------------
  // Read — list & filter
  // ---------------------------------------------------------------------------

  describe('Listing Retrieval', () => {
    it('Should get all listings with default pagination @p0 @sanity @regression', async () => {
      const response = await pactum
        .spec()
        .get(ENDPOINTS.LISTINGS.BASE)
        .expectStatus(200)
        .expectJsonLike(listingResponses.GET_ALL_LISTINGS_RESPONSE)
        .returns('res.body');

      const { listings, pagination } = response;
      expect(Array.isArray(listings)).toBe(true);
      expect(listings.length).toBeGreaterThan(0);
      expect(listings[0]).toHaveProperty('_id');
      expect(listings[0]).toHaveProperty('title');
      expect(listings[0]).toHaveProperty('price');
      expect(listings[0]).toHaveProperty('isAvailable');
      expect(pagination.page).toEqual(expect.any(Number));
      expect(pagination.total).toEqual(expect.any(Number));
    });

    it('Should filter listings by city @p1 @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.LISTINGS.BASE)
        .withQueryParams('city', 'Malibu')
        .expectStatus(200)
        .expectJsonLike(listingResponses.GET_FILTERED_LISTINGS_RESPONSE);
    });

    it('Should filter listings by minimum guest capacity @p1 @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.LISTINGS.BASE)
        .withQueryParams('guests', '8')
        .expectStatus(200)
        .expectJsonLike(listingResponses.GET_FILTERED_LISTINGS_RESPONSE);
    });

    it('Should get a listing by known ID @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.LISTINGS.BY_ID(SEED_LISTING_ID))
        .expectStatus(200)
        .expectJsonLike(listingResponses.GET_LISTING_BY_ID_RESPONSE);
    });

    it('Should return 404 for a non-existent listing ID @p1 @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.LISTINGS.BY_ID(NON_EXISTENT_LISTING_ID))
        .expectStatus(404)
        .expectJsonLike(listingResponses.LISTING_NOT_FOUND_RESPONSE);
    });
  });

  // ---------------------------------------------------------------------------
  // Availability
  // ---------------------------------------------------------------------------

  describe('Listing Availability', () => {
    it('Should get availability for a known listing @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.LISTINGS.AVAILABILITY(SEED_LISTING_ID))
        .withQueryParams({ startDate: '2026-08-01', endDate: '2026-08-07' })
        .expectStatus(200)
        .expectJsonLike(listingResponses.GET_AVAILABILITY_RESPONSE);
    });

    it('Should return 404 when getting availability for a non-existent listing @p1 @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.LISTINGS.AVAILABILITY(NON_EXISTENT_LISTING_ID))
        .withQueryParams({ startDate: '2026-08-01', endDate: '2026-08-07' })
        .expectStatus(404)
        .expectJsonLike(listingResponses.GENERIC_NOT_FOUND_RESPONSE);
    });
  });

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  describe('Listing Creation', () => {
    it('Should create a new listing as authenticated host @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .post(ENDPOINTS.LISTINGS.BASE)
        .withHeaders({ Authorization: 'Bearer ' + hostToken })
        .withJson(listingPayloads.buildCreateListingPayload())
        .expectStatus(201)
        .expectJsonLike(listingResponses.CREATE_LISTING_SUCCESS_RESPONSE);
    });

    it('Should return 401 when creating listing without auth token @p1 @regression', async () => {
      await pactum
        .spec()
        .post(ENDPOINTS.LISTINGS.BASE)
        .withJson(listingPayloads.CREATE_LISTING_UNAUTH_PAYLOAD)
        .expectStatus(401)
        .expectJsonLike(listingResponses.UNAUTH_ERROR_RESPONSE);
    });
  });

  // ---------------------------------------------------------------------------
  // Update
  // ---------------------------------------------------------------------------

  describe('Listing Update', () => {
    it('Should update a listing as the host owner @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .put(ENDPOINTS.LISTINGS.BY_ID(createdListingId))
        .withHeaders({ Authorization: 'Bearer ' + hostToken })
        .withJson(listingPayloads.UPDATE_LISTING_PAYLOAD)
        .expectStatus(200)
        .expectJsonLike(listingResponses.UPDATE_LISTING_SUCCESS_RESPONSE);
    });

    it('Should return 403 when non-owner tries to update a listing @p1 @regression', async () => {
      await pactum
        .spec()
        .put(ENDPOINTS.LISTINGS.BY_ID(SEED_LISTING_ID))
        .withHeaders({ Authorization: 'Bearer ' + hostToken })
        .withJson(listingPayloads.UPDATE_LISTING_NON_OWNER_PAYLOAD)
        .expectStatus(403)
        .expectJsonLike(listingResponses.UPDATE_LISTING_FORBIDDEN_RESPONSE);
    });

    it('Should return 404 when updating a non-existent listing @p1 @regression', async () => {
      await pactum
        .spec()
        .put(ENDPOINTS.LISTINGS.BY_ID(NON_EXISTENT_LISTING_ID))
        .withHeaders({ Authorization: 'Bearer ' + hostToken })
        .withJson(listingPayloads.UPDATE_LISTING_NOT_FOUND_PAYLOAD)
        .expectStatus(404)
        .expectJsonLike(listingResponses.GENERIC_NOT_FOUND_RESPONSE);
    });
  });

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  describe('Listing Deletion', () => {
    it('Should delete a listing as the host owner @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .delete(ENDPOINTS.LISTINGS.BY_ID(createdListingId))
        .withHeaders({ Authorization: 'Bearer ' + hostToken })
        .expectStatus(200)
        .expectJsonLike(listingResponses.DELETE_LISTING_SUCCESS_RESPONSE);
    });

    it('Should return 403 when non-owner tries to delete a listing @p1 @regression', async () => {
      await pactum
        .spec()
        .delete(ENDPOINTS.LISTINGS.BY_ID(SEED_LISTING_ID))
        .withHeaders({ Authorization: 'Bearer ' + hostToken })
        .expectStatus(403)
        .expectJsonLike(listingResponses.GENERIC_FORBIDDEN_RESPONSE);
    });

    it('Should return 404 when deleting a non-existent listing @p1 @regression', async () => {
      await pactum
        .spec()
        .delete(ENDPOINTS.LISTINGS.BY_ID(NON_EXISTENT_LISTING_ID))
        .withHeaders({ Authorization: 'Bearer ' + hostToken })
        .expectStatus(404)
        .expectJsonLike(listingResponses.GENERIC_NOT_FOUND_RESPONSE);
    });
  });
});
