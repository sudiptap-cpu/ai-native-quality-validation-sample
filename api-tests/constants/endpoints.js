'use strict';

const ENDPOINTS = {
  HEALTH: '/health',

  // Auth
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_PROFILE: '/api/auth/profile',

  // Listings
  LISTINGS: '/api/listings',
  LISTING_BY_ID: (id) => `/api/listings/${id}`,
  LISTING_AVAILABILITY: (id) => `/api/listings/${id}/availability`,

  // Bookings
  BOOKINGS: '/api/bookings',
  BOOKINGS_USER: '/api/bookings/user',
  BOOKINGS_HOST: '/api/bookings/host',
  BOOKING_CANCEL: (id) => `/api/bookings/${id}/cancel`,

  // Reviews
  REVIEWS: '/api/reviews',
  REVIEWS_BY_LISTING: (listingId) => `/api/reviews/listing/${listingId}`,
};

module.exports = ENDPOINTS;
