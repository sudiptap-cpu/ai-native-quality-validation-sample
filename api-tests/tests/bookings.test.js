'use strict';

const pactum = require('pactum');
const ENDPOINTS = require('../constants/endpoints');
const PAYLOADS = require('../constants/payloads');
const { KNOWN_IDS, EXPECTED_MESSAGES, EXPECTED_ERRORS } = require('../constants/responses');
const { login } = require('../helpers/auth.helper');

beforeAll(() => {
  pactum.request.setBaseUrl(global.config.HOST_URL);
});

// Module-level variable to share bookingId between scenario_30, 31, and 38
let createdBookingId = null;

describe('Bookings - Create', () => {
  let testUserToken;
  let adminToken;

  beforeAll(async () => {
    testUserToken = await login(
      PAYLOADS.auth.loginTestUser.email,
      PAYLOADS.auth.loginTestUser.password
    );
    adminToken = await login(
      PAYLOADS.auth.loginAdmin.email,
      PAYLOADS.auth.loginAdmin.password
    );
  });

  it('POST /api/bookings → 201 creates booking for far-future dates', async () => {
    // scenario_30: 2027-07-01 to 2027-07-05 = 4 nights at $850 = $3400
    const response = await pactum.spec()
      .post(ENDPOINTS.BOOKINGS)
      .withHeaders('Authorization', `Bearer ${testUserToken}`)
      .withJson(PAYLOADS.bookings.createBooking)
      .expectStatus(201)
      .expect((ctx) => {
        const body = ctx.res.body;
        expect(body.message).toBe(EXPECTED_MESSAGES.BOOKING_CREATED);
        expect(body.booking.status).toBe('confirmed');
        expect(body.booking.totalPrice).toBe(3400);
      })
      .returns('booking._id');

    createdBookingId = response;
    console.log(`Created booking with id: ${createdBookingId}`);
  });

  it('POST /api/bookings → 400 on date conflict (same dates as previous booking)', async () => {
    // scenario_31: same dates as scenario_30 should conflict
    await pactum.spec()
      .post(ENDPOINTS.BOOKINGS)
      .withHeaders('Authorization', `Bearer ${testUserToken}`)
      .withJson(PAYLOADS.bookings.createBooking)
      .expectStatus(400)
      .expect((ctx) => {
        expect(ctx.res.body.error).toBeDefined();
      });
  });

  it('POST /api/bookings → 404 for non-existent listing', async () => {
    await pactum.spec()
      .post(ENDPOINTS.BOOKINGS)
      .withHeaders('Authorization', `Bearer ${testUserToken}`)
      .withJson(PAYLOADS.bookings.nonExistentListing)
      .expectStatus(404)
      .expect((ctx) => {
        expect(ctx.res.body.error).toBeDefined();
      });
  });

  it('POST /api/bookings → 401 without auth', async () => {
    await pactum.spec()
      .post(ENDPOINTS.BOOKINGS)
      .withJson(PAYLOADS.bookings.createBooking)
      .expectStatus(401);
  });
});

describe('Bookings - Get user bookings', () => {
  let testUserToken;
  let loginTestToken;

  beforeAll(async () => {
    testUserToken = await login(
      PAYLOADS.auth.loginTestUser.email,
      PAYLOADS.auth.loginTestUser.password
    );
    loginTestToken = await login(
      PAYLOADS.auth.loginLoginTest.email,
      PAYLOADS.auth.loginLoginTest.password
    );
  });

  it('GET /api/bookings/user → 200 returns user bookings with listing info', async () => {
    await pactum.spec()
      .get(ENDPOINTS.BOOKINGS_USER)
      .withHeaders('Authorization', `Bearer ${testUserToken}`)
      .expectStatus(200)
      .expect((ctx) => {
        const body = ctx.res.body;
        expect(Array.isArray(body.bookings)).toBe(true);
        body.bookings.forEach((booking) => {
          expect(typeof booking.listing._id).toBe('string');
          expect(typeof booking.listing.title).toBe('string');
        });
      });
  });

  it('GET /api/bookings/user → 200 returns empty array for user with no bookings', async () => {
    // logintest@lambdatest.com has no bookings in mock data (scenario_35)
    await pactum.spec()
      .get(ENDPOINTS.BOOKINGS_USER)
      .withHeaders('Authorization', `Bearer ${loginTestToken}`)
      .expectStatus(200)
      .expect((ctx) => {
        const body = ctx.res.body;
        expect(Array.isArray(body.bookings)).toBe(true);
        expect(body.bookings.length).toBe(0);
      });
  });

  it('GET /api/bookings/user → 401 without auth', async () => {
    await pactum.spec()
      .get(ENDPOINTS.BOOKINGS_USER)
      .expectStatus(401);
  });
});

describe('Bookings - Get host bookings', () => {
  let abhishekToken;

  beforeAll(async () => {
    abhishekToken = await login(
      PAYLOADS.auth.loginAbhishek.email,
      PAYLOADS.auth.loginAbhishek.password
    );
  });

  it('GET /api/bookings/host → 200 returns host bookings', async () => {
    // abhishekkumar is hostId for listing 607f1f77bcf86cd799439021 which now has bookings
    await pactum.spec()
      .get(ENDPOINTS.BOOKINGS_HOST)
      .withHeaders('Authorization', `Bearer ${abhishekToken}`)
      .expectStatus(200)
      .expect((ctx) => {
        const body = ctx.res.body;
        expect(Array.isArray(body.bookings)).toBe(true);
        expect(body.bookings.length).toBeGreaterThan(0);
        body.bookings.forEach((booking) => {
          expect(booking.hostId).toBeDefined();
        });
      });
  });
});

describe('Bookings - Cancel', () => {
  let testUserToken;
  let adminToken;

  beforeAll(async () => {
    testUserToken = await login(
      PAYLOADS.auth.loginTestUser.email,
      PAYLOADS.auth.loginTestUser.password
    );
    adminToken = await login(
      PAYLOADS.auth.loginAdmin.email,
      PAYLOADS.auth.loginAdmin.password
    );
  });

  it('PUT /api/bookings/:id/cancel → 200 cancels own booking', async () => {
    // scenario_38: cancel the booking created in scenario_30
    expect(createdBookingId).not.toBeNull();

    await pactum.spec()
      .put(ENDPOINTS.BOOKING_CANCEL(createdBookingId))
      .withHeaders('Authorization', `Bearer ${testUserToken}`)
      .expectStatus(200)
      .expect((ctx) => {
        const body = ctx.res.body;
        expect(body.message).toBe(EXPECTED_MESSAGES.BOOKING_CANCELLED);
        expect(body.booking.status).toBe('cancelled');
      });
  });

  it('PUT /api/bookings/:id/cancel → 403 when not authorized to cancel', async () => {
    // scenario_39: booking 707f1f77bcf86cd799439031 belongs to emma.davis (guest)
    // and abhishekkumar (host). testuser (507f1f77bcf86cd799439017) is neither.
    await pactum.spec()
      .put(ENDPOINTS.BOOKING_CANCEL(KNOWN_IDS.EMMA_BOOKING_ID))
      .withHeaders('Authorization', `Bearer ${testUserToken}`)
      .expectStatus(403)
      .expect((ctx) => {
        expect(ctx.res.body.error).toBe(EXPECTED_ERRORS.NOT_AUTHORIZED_CANCEL_BOOKING);
      });
  });

  it('PUT /api/bookings/:id/cancel → 404 for non-existent booking', async () => {
    await pactum.spec()
      .put(ENDPOINTS.BOOKING_CANCEL(KNOWN_IDS.ZERO_BOOKING_ID))
      .withHeaders('Authorization', `Bearer ${adminToken}`)
      .expectStatus(404)
      .expect((ctx) => {
        expect(ctx.res.body.error).toBe(EXPECTED_ERRORS.BOOKING_NOT_FOUND);
      });
  });
});
