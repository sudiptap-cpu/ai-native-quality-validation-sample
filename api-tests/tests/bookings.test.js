/**
 * @feature @bookings
 * Bookings module API tests — create, list, and cancel bookings.
 *
 * Setup strategy:
 *   - guestToken: testuser@lambdatest.com — creates and cancels bookings
 *   - hostToken: lambdatestadmin@email.com — used for GET /bookings/host
 *   - createdBookingId: booking created in beforeAll against listing
 *     607f1f77bcf86cd799439022 (Sep 2026 dates) — used for scenario_31 cancel test
 */
const pactum = require('pactum');
const { ENDPOINTS } = require('../constants/endpoints');
const { bookingPayloads } = require('../constants/payloads/bookingPayloads');
const { bookingResponses } = require('../constants/responses/bookingResponses');

describe('Bookings API Tests', () => {
  let guestToken;
  let hostToken;
  let createdBookingId;

  beforeAll(async () => {
    // Acquire guest token for booking creation and cancellation flows
    guestToken = await pactum
      .spec()
      .post(ENDPOINTS.AUTH.LOGIN)
      .withJson({ email: global.config.GUEST_EMAIL, password: global.config.GUEST_PASSWORD })
      .expectStatus(200)
      .returns('res.body.token');

    // Acquire host token for GET /bookings/host test
    hostToken = await pactum
      .spec()
      .post(ENDPOINTS.AUTH.LOGIN)
      .withJson({ email: global.config.HOST_EMAIL, password: global.config.HOST_PASSWORD })
      .expectStatus(200)
      .returns('res.body.token');

    // Pre-create a booking so scenario_31 (cancel) has a valid booking ID to act on
    createdBookingId = await pactum
      .spec()
      .post(ENDPOINTS.BOOKINGS.BASE)
      .withHeaders({ Authorization: 'Bearer ' + guestToken })
      .withJson(bookingPayloads.CREATE_BOOKING_PAYLOAD)
      .expectStatus(201)
      .returns('res.body.booking._id');

    console.log(`Bookings beforeAll: created booking ID = ${createdBookingId}`);
  });

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  describe('Booking Creation', () => {
    it('Should create a booking as authenticated user @p0 @sanity @regression', async () => {
      // Uses CREATE_BOOKING_ASSERT_PAYLOAD (Oct 10-14 dates) to avoid conflict with the
      // beforeAll booking (Sep 1-5) and the unauth test payload (Oct 1-5)
      await pactum
        .spec()
        .post(ENDPOINTS.BOOKINGS.BASE)
        .withHeaders({ Authorization: 'Bearer ' + guestToken })
        .withJson(bookingPayloads.CREATE_BOOKING_ASSERT_PAYLOAD)
        .expectStatus(201)
        .expectJsonLike(bookingResponses.CREATE_BOOKING_SUCCESS_RESPONSE);
    });

    it('Should return 401 when creating a booking without auth token @p1 @regression', async () => {
      await pactum
        .spec()
        .post(ENDPOINTS.BOOKINGS.BASE)
        .withJson(bookingPayloads.CREATE_BOOKING_UNAUTH_PAYLOAD)
        .expectStatus(401)
        .expectJsonLike(bookingResponses.UNAUTH_ERROR_RESPONSE);
    });
  });

  // ---------------------------------------------------------------------------
  // List
  // ---------------------------------------------------------------------------

  describe('Booking Listing', () => {
    it('Should get guest bookings for authenticated user @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.BOOKINGS.USER)
        .withHeaders({ Authorization: 'Bearer ' + guestToken })
        .expectStatus(200)
        .expectJsonLike(bookingResponses.GET_USER_BOOKINGS_RESPONSE);
    });

    it('Should return 401 when getting guest bookings without auth token @p1 @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.BOOKINGS.USER)
        .expectStatus(401)
        .expectJsonLike(bookingResponses.UNAUTH_ERROR_RESPONSE);
    });

    it('Should get host bookings for authenticated host @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.BOOKINGS.HOST)
        .withHeaders({ Authorization: 'Bearer ' + hostToken })
        .expectStatus(200)
        .expectJsonLike(bookingResponses.GET_HOST_BOOKINGS_RESPONSE);
    });

    it('Should return 401 when getting host bookings without auth token @p1 @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.BOOKINGS.HOST)
        .expectStatus(401)
        .expectJsonLike(bookingResponses.UNAUTH_ERROR_RESPONSE);
    });
  });

  // ---------------------------------------------------------------------------
  // Cancel
  // ---------------------------------------------------------------------------

  describe('Booking Cancellation', () => {
    it('Should cancel a booking as the booking owner @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .put(ENDPOINTS.BOOKINGS.CANCEL(createdBookingId))
        .withHeaders({ Authorization: 'Bearer ' + guestToken })
        .expectStatus(200)
        .expectJsonLike(bookingResponses.CANCEL_BOOKING_SUCCESS_RESPONSE);
    });

    it('Should return 401 when cancelling a booking without auth token @p1 @regression', async () => {
      // Uses the already-created booking ID; the auth check fires before ownership check
      await pactum
        .spec()
        .put(ENDPOINTS.BOOKINGS.CANCEL(createdBookingId))
        .expectStatus(401)
        .expectJsonLike(bookingResponses.UNAUTH_ERROR_RESPONSE);
    });
  });
});
