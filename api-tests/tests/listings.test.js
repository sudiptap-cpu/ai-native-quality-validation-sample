'use strict';

const pactum = require('pactum');
const ENDPOINTS = require('../constants/endpoints');
const PAYLOADS = require('../constants/payloads');
const { KNOWN_IDS, EXPECTED_MESSAGES, EXPECTED_ERRORS } = require('../constants/responses');
const { login } = require('../helpers/auth.helper');

beforeAll(() => {
  pactum.request.setBaseUrl(global.config.HOST_URL);
});

describe('Listings - GET all', () => {
  it('GET /api/listings → 200 with default pagination', async () => {
    await pactum.spec()
      .get(ENDPOINTS.LISTINGS)
      .expectStatus(200)
      .expect((ctx) => {
        const body = ctx.res.body;
        expect(Array.isArray(body.listings)).toBe(true);
        expect(body.listings.length).toBeGreaterThan(0);
        expect(body.listings[0]._id).toBeDefined();
        expect(body.pagination.page).toBeDefined();
        expect(body.pagination.limit).toBeDefined();
        expect(body.pagination.total).toBeDefined();
      });
  });

  it('GET /api/listings?city=Malibu → 200 with Malibu listings', async () => {
    await pactum.spec()
      .get(ENDPOINTS.LISTINGS)
      .withQueryParams('city', 'Malibu')
      .expectStatus(200)
      .expect((ctx) => {
        const body = ctx.res.body;
        expect(body.listings.length).toBeGreaterThan(0);
        body.listings.forEach((listing) => {
          expect(listing.location.city.toLowerCase()).toContain('malibu');
        });
      });
  });

  it('GET /api/listings?minPrice=800&maxPrice=1000 → 200 within price range', async () => {
    await pactum.spec()
      .get(ENDPOINTS.LISTINGS)
      .withQueryParams({ minPrice: '800', maxPrice: '1000' })
      .expectStatus(200)
      .expect((ctx) => {
        const body = ctx.res.body;
        body.listings.forEach((listing) => {
          expect(listing.price).toBeGreaterThanOrEqual(800);
          expect(listing.price).toBeLessThanOrEqual(1000);
        });
      });
  });

  it('GET /api/listings?propertyType=Villa → 200 only Villa type', async () => {
    await pactum.spec()
      .get(ENDPOINTS.LISTINGS)
      .withQueryParams('propertyType', 'Villa')
      .expectStatus(200)
      .expect((ctx) => {
        const body = ctx.res.body;
        expect(body.listings.length).toBeGreaterThan(0);
        body.listings.forEach((listing) => {
          expect(listing.propertyType).toBe('Villa');
        });
      });
  });

  it('GET /api/listings?guests=8 → 200 listings with maxGuests >= 8', async () => {
    await pactum.spec()
      .get(ENDPOINTS.LISTINGS)
      .withQueryParams('guests', '8')
      .expectStatus(200)
      .expect((ctx) => {
        const body = ctx.res.body;
        body.listings.forEach((listing) => {
          expect(listing.maxGuests).toBeGreaterThanOrEqual(8);
        });
      });
  });

  it('GET /api/listings?page=1&limit=5 → 200 with up to 5 listings', async () => {
    await pactum.spec()
      .get(ENDPOINTS.LISTINGS)
      .withQueryParams({ page: '1', limit: '5' })
      .expectStatus(200)
      .expect((ctx) => {
        const body = ctx.res.body;
        expect(body.listings.length).toBeLessThanOrEqual(5);
        expect(body.pagination.page).toBe(1);
        expect(body.pagination.limit).toBe(5);
      });
  });

  it('GET /api/listings?city=NonExistentCityXYZ → 200 with empty listings', async () => {
    await pactum.spec()
      .get(ENDPOINTS.LISTINGS)
      .withQueryParams('city', 'NonExistentCityXYZ')
      .expectStatus(200)
      .expect((ctx) => {
        const body = ctx.res.body;
        expect(body.listings.length).toBe(0);
        expect(body.pagination.total).toBe(0);
      });
  });
});

describe('Listings - GET by ID', () => {
  it('GET /api/listings/:id → 200 for known listing', async () => {
    await pactum.spec()
      .get(ENDPOINTS.LISTING_BY_ID(KNOWN_IDS.MALIBU_VILLA_ID))
      .expectStatus(200)
      .expect((ctx) => {
        const body = ctx.res.body;
        expect(body.listing._id).toBe(KNOWN_IDS.MALIBU_VILLA_ID);
        expect(body.listing.title).toBe('Stunning Oceanfront Villa in Malibu');
        expect(body.listing.price).toBe(850);
        expect(Array.isArray(body.reviews)).toBe(true);
      });
  });

  it('GET /api/listings/:id → 404 for non-existent listing', async () => {
    await pactum.spec()
      .get(ENDPOINTS.LISTING_BY_ID(KNOWN_IDS.ZERO_LISTING_ID))
      .expectStatus(404)
      .expect((ctx) => {
        expect(ctx.res.body.error).toBe(EXPECTED_ERRORS.LISTING_NOT_FOUND);
      });
  });
});

describe('Listings - Availability', () => {
  it('GET /api/listings/:id/availability → 200 for far-future available dates', async () => {
    await pactum.spec()
      .get(ENDPOINTS.LISTING_AVAILABILITY(KNOWN_IDS.MALIBU_VILLA_ID))
      .withQueryParams({ startDate: '2027-06-01', endDate: '2027-06-07' })
      .expectStatus(200)
      .expect((ctx) => {
        const body = ctx.res.body;
        expect(body.available).toBe(true);
        expect(body.blockedDates.length).toBe(0);
      });
  });

  it('GET /api/listings/:id/availability → 200 verify response shape', async () => {
    await pactum.spec()
      .get(ENDPOINTS.LISTING_AVAILABILITY(KNOWN_IDS.MALIBU_VILLA_ID))
      .withQueryParams({ startDate: '2027-09-01', endDate: '2027-09-07' })
      .expectStatus(200)
      .expect((ctx) => {
        const body = ctx.res.body;
        expect(typeof body.available).toBe('boolean');
        expect(Array.isArray(body.blockedDates)).toBe(true);
      });
  });

  it('GET /api/listings/:id/availability → 404 for non-existent listing', async () => {
    await pactum.spec()
      .get(ENDPOINTS.LISTING_AVAILABILITY(KNOWN_IDS.ZERO_LISTING_ID))
      .withQueryParams({ startDate: '2027-06-01', endDate: '2027-06-07' })
      .expectStatus(404)
      .expect((ctx) => {
        expect(ctx.res.body.error).toBe(EXPECTED_ERRORS.LISTING_NOT_FOUND);
      });
  });
});

describe('Listings - Create', () => {
  let adminToken;

  beforeAll(async () => {
    adminToken = await login(
      PAYLOADS.auth.loginAdmin.email,
      PAYLOADS.auth.loginAdmin.password
    );
  });

  it('POST /api/listings → 201 creates a new listing', async () => {
    await pactum.spec()
      .post(ENDPOINTS.LISTINGS)
      .withHeaders('Authorization', `Bearer ${adminToken}`)
      .withJson(PAYLOADS.listings.createListing)
      .expectStatus(201)
      .expect((ctx) => {
        const body = ctx.res.body;
        expect(body.message).toBe(EXPECTED_MESSAGES.LISTING_CREATED);
        expect(typeof body.listing._id).toBe('string');
        expect(body.listing.isAvailable).toBe(true);
      });
  });

  it('POST /api/listings → 401 without auth', async () => {
    await pactum.spec()
      .post(ENDPOINTS.LISTINGS)
      .withJson(PAYLOADS.listings.createListing)
      .expectStatus(401);
  });
});

describe('Listings - Update', () => {
  let abhishekToken;
  let testUserToken;
  let adminToken;

  beforeAll(async () => {
    abhishekToken = await login(
      PAYLOADS.auth.loginAbhishek.email,
      PAYLOADS.auth.loginAbhishek.password
    );
    testUserToken = await login(
      PAYLOADS.auth.loginTestUser.email,
      PAYLOADS.auth.loginTestUser.password
    );
    adminToken = await login(
      PAYLOADS.auth.loginAdmin.email,
      PAYLOADS.auth.loginAdmin.password
    );
  });

  it('PUT /api/listings/:id → 200 by listing host', async () => {
    await pactum.spec()
      .put(ENDPOINTS.LISTING_BY_ID(KNOWN_IDS.MALIBU_VILLA_ID))
      .withHeaders('Authorization', `Bearer ${abhishekToken}`)
      .withJson(PAYLOADS.listings.updateListingPrice)
      .expectStatus(200)
      .expect((ctx) => {
        const body = ctx.res.body;
        expect(body.message).toBe(EXPECTED_MESSAGES.LISTING_UPDATED);
        expect(body.listing.price).toBe(900);
      });
  });

  it('PUT /api/listings/:id → 403 by non-host user', async () => {
    await pactum.spec()
      .put(ENDPOINTS.LISTING_BY_ID(KNOWN_IDS.MALIBU_VILLA_ID))
      .withHeaders('Authorization', `Bearer ${testUserToken}`)
      .withJson(PAYLOADS.listings.updateListingPrice)
      .expectStatus(403)
      .expect((ctx) => {
        expect(ctx.res.body.error).toBe(EXPECTED_ERRORS.NOT_AUTHORIZED_UPDATE_LISTING);
      });
  });

  it('PUT /api/listings/:id → 404 for non-existent listing', async () => {
    await pactum.spec()
      .put(ENDPOINTS.LISTING_BY_ID(KNOWN_IDS.ZERO_LISTING_ID))
      .withHeaders('Authorization', `Bearer ${adminToken}`)
      .withJson(PAYLOADS.listings.updateListingPrice)
      .expectStatus(404)
      .expect((ctx) => {
        expect(ctx.res.body.error).toBe(EXPECTED_ERRORS.LISTING_NOT_FOUND);
      });
  });
});

describe('Listings - Delete', () => {
  let adminToken;
  let testUserToken;

  beforeAll(async () => {
    adminToken = await login(
      PAYLOADS.auth.loginAdmin.email,
      PAYLOADS.auth.loginAdmin.password
    );
    testUserToken = await login(
      PAYLOADS.auth.loginTestUser.email,
      PAYLOADS.auth.loginTestUser.password
    );
  });

  it('DELETE /api/listings/:id → 200 deletes own listing', async () => {
    // Create a listing first, then delete it
    const createResponse = await pactum.spec()
      .post(ENDPOINTS.LISTINGS)
      .withHeaders('Authorization', `Bearer ${adminToken}`)
      .withJson(PAYLOADS.listings.createListing)
      .expectStatus(201)
      .returns('listing._id');

    const createdId = createResponse;
    console.log(`Created listing with id: ${createdId} for delete test`);

    await pactum.spec()
      .delete(ENDPOINTS.LISTING_BY_ID(createdId))
      .withHeaders('Authorization', `Bearer ${adminToken}`)
      .expectStatus(200)
      .expect((ctx) => {
        expect(ctx.res.body.message).toBe(EXPECTED_MESSAGES.LISTING_DELETED);
      });
  });

  it('DELETE /api/listings/:id → 403 when not the host', async () => {
    // testuser (_id: 507f1f77bcf86cd799439017) is not the host of Malibu Villa
    // (hostId: 507f1f77bcf86cd799439011 = abhishekkumar)
    await pactum.spec()
      .delete(ENDPOINTS.LISTING_BY_ID(KNOWN_IDS.MALIBU_VILLA_ID))
      .withHeaders('Authorization', `Bearer ${testUserToken}`)
      .expectStatus(403)
      .expect((ctx) => {
        expect(ctx.res.body.error).toBe(EXPECTED_ERRORS.NOT_AUTHORIZED_DELETE_LISTING);
      });
  });

  it('DELETE /api/listings/:id → 404 for non-existent listing', async () => {
    await pactum.spec()
      .delete(ENDPOINTS.LISTING_BY_ID(KNOWN_IDS.ZERO_LISTING_ID))
      .withHeaders('Authorization', `Bearer ${adminToken}`)
      .expectStatus(404)
      .expect((ctx) => {
        expect(ctx.res.body.error).toBe(EXPECTED_ERRORS.LISTING_NOT_FOUND);
      });
  });
});
