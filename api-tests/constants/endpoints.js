/**
 * API endpoint constants grouped by module.
 * All paths are relative to the base URL configured in jest.setup.js.
 */
const ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    PROFILE: '/api/auth/profile',
  },

  LISTINGS: {
    BASE: '/api/listings',
    BY_ID: (id) => `/api/listings/${id}`,
    AVAILABILITY: (id) => `/api/listings/${id}/availability`,
  },

  BOOKINGS: {
    BASE: '/api/bookings',
    USER: '/api/bookings/user',
    HOST: '/api/bookings/host',
    CANCEL: (id) => `/api/bookings/${id}/cancel`,
  },

  REVIEWS: {
    BASE: '/api/reviews',
    BY_LISTING: (listingId) => `/api/reviews/listing/${listingId}`,
  },

  HEALTH: '/health',
};

module.exports = { ENDPOINTS };
