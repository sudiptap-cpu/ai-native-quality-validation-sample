'use strict';

const ENDPOINTS = {
  HEALTH: '/health',

  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_PROFILE: '/api/auth/profile',

  LISTINGS: '/api/listings',
  LISTING_BY_ID: (id) => `/api/listings/${id}`,
  LISTING_AVAILABILITY: (id) => `/api/listings/${id}/availability`,

  BOOKINGS: '/api/bookings',
  BOOKINGS_USER: '/api/bookings/user',
  BOOKINGS_HOST: '/api/bookings/host',
  BOOKING_CANCEL: (id) => `/api/bookings/${id}/cancel`,

  REVIEWS: '/api/reviews',
  REVIEWS_BY_LISTING: (listingId) => `/api/reviews/listing/${listingId}`,
};

module.exports = { ENDPOINTS };
