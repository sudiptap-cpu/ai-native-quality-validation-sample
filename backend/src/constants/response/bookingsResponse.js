/**
 * Response shape constants for the bookings module.
 * Used with pactum .expectJsonLike() assertions in bookings tests.
 */

const bookingsResponses = {
  /** 400 response when guests exceed the absolute platform limit of 16. */
  MAX_GUESTS_EXCEEDED_RESPONSE: {
    error: 'Maximum 16 guests allowed',
  },

  /** 401 response when no Authorization header is provided. */
  UNAUTHORIZED_RESPONSE: {
    error: '#string',
  },

  /** 201 response for a successful booking creation with 1 guest. */
  BOOKING_CREATED_1_GUEST_RESPONSE: {
    message: 'Booking created successfully',
    booking: {
      _id: '#string',
      listingId: '#string',
      guests: 1,
    },
  },
};

module.exports = { bookingsResponses };
