/**
 * Response shape constants for the bookings module.
 * Uses pactum '#type' matchers for runtime type assertions via expectJsonLike.
 */
const bookingResponses = {
  /** Expected shape for successful booking creation (201) */
  CREATE_BOOKING_SUCCESS_RESPONSE: {
    message: 'Booking created successfully',
    booking: {
      _id: '#string',
      listingId: '#string',
      guestId: '#string',
      checkIn: '#string',
      checkOut: '#string',
      guests: '#number',
      totalPrice: '#number',
      status: 'confirmed',
    },
  },

  /** Expected error shape for unauthenticated requests (401) */
  UNAUTH_ERROR_RESPONSE: {
    error: '#string',
  },

  /** Expected shape for GET /api/bookings/user (200) */
  GET_USER_BOOKINGS_RESPONSE: {
    bookings: '#array',
  },

  /** Expected shape for GET /api/bookings/host (200) */
  GET_HOST_BOOKINGS_RESPONSE: {
    bookings: '#array',
  },

  /** Expected shape for successful booking cancellation (200) */
  CANCEL_BOOKING_SUCCESS_RESPONSE: {
    message: 'Booking cancelled successfully',
    booking: {
      _id: '#string',
      status: 'cancelled',
    },
  },
};

module.exports = { bookingResponses };
