'use strict';

const pactum = require('pactum');
const { BASE_URL } = require('../config/base');
const { ENDPOINTS } = require('../constants/endpoints');
const { AUTH_PAYLOADS, BOOKING_PAYLOADS, LISTING_PAYLOADS } = require('../constants/payloads');
const { login, bearerHeader } = require('../helpers/auth.helper');

describe('@airbnb_api Bookings', () => {
  beforeAll(() => {
    pactum.request.setBaseUrl(BASE_URL);
  });

  let guestToken;
  let hostToken;
  let createdBookingId;

  beforeAll(async () => {
    guestToken = await login(
      AUTH_PAYLOADS.LOGIN_GUEST.email,
      AUTH_PAYLOADS.LOGIN_GUEST.password
    );
    hostToken = await login(
      AUTH_PAYLOADS.LOGIN_ADMIN.email,
      AUTH_PAYLOADS.LOGIN_ADMIN.password
    );
  });

  describe('Create Booking', () => {
    it('Should create a booking as an authenticated guest @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .post(ENDPOINTS.BOOKINGS)
        .withHeaders({ Authorization: bearerHeader(guestToken) })
        .withJson(BOOKING_PAYLOADS.CREATE_BOOKING_GUEST)
        .expectStatus(201);
    });

    it('Should return 401 when creating a booking without token @p1 @regression', async () => {
      await pactum
        .spec()
        .post(ENDPOINTS.BOOKINGS)
        .withJson(BOOKING_PAYLOADS.CREATE_BOOKING_NO_AUTH)
        .expectStatus(401);
    });
  });

  describe('Get User Bookings', () => {
    it('Should get all bookings for authenticated guest user @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.BOOKINGS_USER)
        .withHeaders({ Authorization: bearerHeader(guestToken) })
        .expectStatus(200)
        .expectJsonLike({
          bookings: [],
        });
    });

    it('Should return 401 when getting user bookings without token @p1 @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.BOOKINGS_USER)
        .expectStatus(401);
    });
  });

  describe('Get Host Bookings', () => {
    it('Should get all bookings for authenticated host @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.BOOKINGS_HOST)
        .withHeaders({ Authorization: bearerHeader(hostToken) })
        .expectStatus(200)
        .expectJsonLike({
          bookings: [],
        });
    });

    it('Should return 401 when getting host bookings without token @p1 @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.BOOKINGS_HOST)
        .expectStatus(401);
    });
  });

  describe('Cancel Booking', () => {
    beforeAll(async () => {
      const response = await pactum
        .spec()
        .post(ENDPOINTS.BOOKINGS)
        .withHeaders({ Authorization: bearerHeader(guestToken) })
        .withJson(BOOKING_PAYLOADS.buildBookingPayload())
        .expectStatus(201)
        .returns('booking._id');
      createdBookingId = response;
    });

    it('Should cancel a booking as authenticated user @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .put(ENDPOINTS.BOOKING_CANCEL(createdBookingId))
        .withHeaders({ Authorization: bearerHeader(guestToken) })
        .expectStatus(200);
    });

    it('Should return 401 when cancelling a booking without token @p1 @regression', async () => {
      await pactum
        .spec()
        .put(ENDPOINTS.BOOKING_CANCEL('707f1f77bcf86cd799439031'))
        .expectStatus(401);
    });
  });
});
