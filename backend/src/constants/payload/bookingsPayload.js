/**
 * Payload constants for the bookings module.
 * All request bodies used in bookings tests are defined here.
 *
 * Listing IDs reference mock data from src/data/mockData.ts:
 *   607f1f77bcf86cd799439034 => Mountain Lodge, maxGuests: 12
 *   607f1f77bcf86cd799439030 => Luxury Beachfront Villa, maxGuests: 10
 */

const bookingsPayload = {
  /** Booking with 17 guests — one above the absolute platform limit of 16. */
  CREATE_BOOKING_17_GUESTS: {
    listingId: '607f1f77bcf86cd799439034',
    checkIn: '2026-08-01',
    checkOut: '2026-08-05',
    guests: 17,
  },

  /** Booking with 20 guests — well above the absolute platform limit of 16. */
  CREATE_BOOKING_20_GUESTS: {
    listingId: '607f1f77bcf86cd799439034',
    checkIn: '2026-08-01',
    checkOut: '2026-08-05',
    guests: 20,
  },

  /** Booking with 1 guest against a listing with maxGuests >= 1. */
  CREATE_BOOKING_1_GUEST: {
    listingId: '607f1f77bcf86cd799439030',
    checkIn: '2026-08-10',
    checkOut: '2026-08-14',
    guests: 1,
  },

  /** Booking with 2 guests — used for the unauthenticated scenario. */
  CREATE_BOOKING_NO_AUTH: {
    listingId: '607f1f77bcf86cd799439030',
    checkIn: '2026-08-01',
    checkOut: '2026-08-05',
    guests: 2,
  },
};

module.exports = { bookingsPayload };
