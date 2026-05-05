/**
 * Payload constants for the bookings module.
 * Dates use Sep 2026 to avoid conflicts with the seeded Nov 2024 booking
 * on listing 607f1f77bcf86cd799439022.
 */
const bookingPayloads = {
  /**
   * Standard booking creation payload against the seed Brooklyn listing.
   * Uses Sep 2026 dates which do not overlap the seeded Nov 2024 booking.
   */
  CREATE_BOOKING_PAYLOAD: {
    listingId: '607f1f77bcf86cd799439022',
    checkIn: '2026-09-01',
    checkOut: '2026-09-05',
    guests: 2,
  },

  /**
   * Booking payload used in the unauthenticated negative test (scenario_26).
   * Uses Oct 2026 dates to avoid conflicts with the primary booking test.
   */
  CREATE_BOOKING_UNAUTH_PAYLOAD: {
    listingId: '607f1f77bcf86cd799439022',
    checkIn: '2026-10-01',
    checkOut: '2026-10-05',
    guests: 2,
  },

  /**
   * Booking payload used in scenario_25 (the main create-booking assertion).
   * Uses mid-Oct 2026 dates to avoid conflict with CREATE_BOOKING_PAYLOAD (Sep 2026)
   * and CREATE_BOOKING_UNAUTH_PAYLOAD (Oct 1-5).
   */
  CREATE_BOOKING_ASSERT_PAYLOAD: {
    listingId: '607f1f77bcf86cd799439022',
    checkIn: '2026-10-10',
    checkOut: '2026-10-14',
    guests: 2,
  },
};

module.exports = { bookingPayloads };
