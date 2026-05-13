'use strict';

const pactum = require('pactum');
const { BASE_URL } = require('../config/base');
const { ENDPOINTS } = require('../constants/endpoints');
const { AUTH_PAYLOADS, LISTING_PAYLOADS } = require('../constants/payloads');
const { login, bearerHeader } = require('../helpers/auth.helper');

// Pre-seeded IDs
const SEEDED_LISTING_ID = '607f1f77bcf86cd799439021';
const NONEXISTENT_LISTING_ID = '000000000000000000000000';
// Listing 607f1f77bcf86cd799439022 used for delete-safe operations (hosted by michael.chen)
const DELETE_SAFE_LISTING_FOR_NONHOST_TEST = '607f1f77bcf86cd799439022';

describe('@airbnb_api Listings', () => {
  beforeAll(() => {
    pactum.request.setBaseUrl(BASE_URL);
  });

  let hostOwnerToken;
  let nonHostToken;
  let adminToken;
  let createdListingId;

  beforeAll(async () => {
    hostOwnerToken = await login(
      AUTH_PAYLOADS.LOGIN_HOST_OWNER.email,
      AUTH_PAYLOADS.LOGIN_HOST_OWNER.password
    );
    nonHostToken = await login(
      AUTH_PAYLOADS.LOGIN_NON_HOST.email,
      AUTH_PAYLOADS.LOGIN_NON_HOST.password
    );
    adminToken = await login(
      AUTH_PAYLOADS.LOGIN_ADMIN.email,
      AUTH_PAYLOADS.LOGIN_ADMIN.password
    );
  });

  describe('Get All Listings', () => {
    it('Should get all listings with no filters @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.LISTINGS)
        .expectStatus(200)
        .expectJsonLike({
          listings: [],
          pagination: {
            page: /\d+/,
            total: /\d+/,
          },
        })
        .expect((ctx) => {
          expect(ctx.res.body.listings.length).toBeGreaterThan(0);
        });
    });

    it('Should get listings filtered by city @p1 @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.LISTINGS)
        .withQueryParams({ city: 'Malibu' })
        .expectStatus(200)
        .expectJsonLike({
          listings: [],
          pagination: {
            total: /\d+/,
          },
        });
    });

    it('Should get listings filtered by minPrice and maxPrice @p1 @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.LISTINGS)
        .withQueryParams({ minPrice: 100, maxPrice: 500 })
        .expectStatus(200)
        .expectJsonLike({
          listings: [],
          pagination: {
            total: /\d+/,
          },
        });
    });

    it('Should get listings filtered by guests count @p1 @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.LISTINGS)
        .withQueryParams({ guests: 2 })
        .expectStatus(200)
        .expectJsonLike({
          listings: [],
          pagination: {
            total: /\d+/,
          },
        });
    });

    it('Should paginate listings results @p1 @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.LISTINGS)
        .withQueryParams({ page: 1, limit: 2 })
        .expectStatus(200)
        .expectJsonLike({
          pagination: {
            page: 1,
            limit: 2,
          },
        })
        .expect((ctx) => {
          expect(ctx.res.body.listings.length).toBeLessThanOrEqual(2);
        });
    });
  });

  describe('Get Single Listing', () => {
    it('Should get a single listing by ID @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.LISTING_BY_ID(SEEDED_LISTING_ID))
        .expectStatus(200)
        .expectJsonLike({
          listing: {
            title: /\w+/,
            price: /\d+/,
            hostId: {
              _id: /\w+/,
            },
          },
          reviews: [],
        });
    });

    it('Should return 404 for non-existent listing ID @p1 @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.LISTING_BY_ID(NONEXISTENT_LISTING_ID))
        .expectStatus(404);
    });
  });

  describe('Listing Availability', () => {
    it('Should check listing availability for given date range @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.LISTING_AVAILABILITY(SEEDED_LISTING_ID))
        .withQueryParams({ startDate: '2026-07-01', endDate: '2026-07-10' })
        .expectStatus(200)
        .expectJsonLike({
          available: /(true|false)/,
          blockedDates: [],
        });
    });

    it('Should return 404 when checking availability for non-existent listing @p1 @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.LISTING_AVAILABILITY(NONEXISTENT_LISTING_ID))
        .withQueryParams({ startDate: '2026-07-01', endDate: '2026-07-10' })
        .expectStatus(404);
    });
  });

  describe('Create Listing', () => {
    it('Should create a new listing as an authenticated host @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .post(ENDPOINTS.LISTINGS)
        .withHeaders({ Authorization: bearerHeader(hostOwnerToken) })
        .withJson(LISTING_PAYLOADS.CREATE_LISTING)
        .expectStatus(201)
        .expectJsonLike({
          message: /\w+/,
          listing: {
            title: 'Test Villa',
          },
        });
    });

    it('Should return 401 when creating a listing without token @p1 @regression', async () => {
      await pactum
        .spec()
        .post(ENDPOINTS.LISTINGS)
        .withJson(LISTING_PAYLOADS.CREATE_LISTING_NO_AUTH)
        .expectStatus(401);
    });
  });

  describe('Update Listing', () => {
    it('Should update an existing listing as the host owner @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .put(ENDPOINTS.LISTING_BY_ID(SEEDED_LISTING_ID))
        .withHeaders({ Authorization: bearerHeader(hostOwnerToken) })
        .withJson(LISTING_PAYLOADS.UPDATE_LISTING_PRICE)
        .expectStatus(200)
        .expectJsonLike({
          message: /\w+/,
          listing: {
            price: /\d+/,
          },
        });
    });

    it('Should return 401 when updating listing without token @p1 @regression', async () => {
      await pactum
        .spec()
        .put(ENDPOINTS.LISTING_BY_ID(SEEDED_LISTING_ID))
        .withJson(LISTING_PAYLOADS.UPDATE_LISTING_PRICE)
        .expectStatus(401);
    });

    it('Should return 403 when non-owner tries to update a listing @p1 @regression', async () => {
      await pactum
        .spec()
        .put(ENDPOINTS.LISTING_BY_ID(SEEDED_LISTING_ID))
        .withHeaders({ Authorization: bearerHeader(nonHostToken) })
        .withJson(LISTING_PAYLOADS.UPDATE_LISTING_PRICE)
        .expectStatus(403);
    });

    it('Should return 404 when updating a non-existent listing @p2 @regression', async () => {
      await pactum
        .spec()
        .put(ENDPOINTS.LISTING_BY_ID(NONEXISTENT_LISTING_ID))
        .withHeaders({ Authorization: bearerHeader(hostOwnerToken) })
        .withJson(LISTING_PAYLOADS.UPDATE_LISTING_PRICE)
        .expectStatus(404);
    });
  });

  describe('Delete Listing', () => {
    beforeAll(async () => {
      const response = await pactum
        .spec()
        .post(ENDPOINTS.LISTINGS)
        .withHeaders({ Authorization: bearerHeader(adminToken) })
        .withJson({ ...LISTING_PAYLOADS.CREATE_LISTING, _id: '999f1f77bcf86cd799439001' })
        .expectStatus(201)
        .returns('listing._id');
      createdListingId = response;
    });

    it('Should delete an existing listing as the host owner @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .delete(ENDPOINTS.LISTING_BY_ID(createdListingId))
        .withHeaders({ Authorization: bearerHeader(adminToken) })
        .expectStatus(200);
    });

    it('Should return 401 when deleting listing without token @p1 @regression', async () => {
      await pactum
        .spec()
        .delete(ENDPOINTS.LISTING_BY_ID('607f1f77bcf86cd799439022'))
        .expectStatus(401);
    });

    it('Should return 403 when non-owner tries to delete a listing @p1 @regression', async () => {
      await pactum
        .spec()
        .delete(ENDPOINTS.LISTING_BY_ID(SEEDED_LISTING_ID))
        .withHeaders({ Authorization: bearerHeader(nonHostToken) })
        .expectStatus(403);
    });

    it('Should return 404 when deleting a non-existent listing @p2 @regression', async () => {
      await pactum
        .spec()
        .delete(ENDPOINTS.LISTING_BY_ID(NONEXISTENT_LISTING_ID))
        .withHeaders({ Authorization: bearerHeader(adminToken) })
        .expectStatus(404);
    });
  });
});
