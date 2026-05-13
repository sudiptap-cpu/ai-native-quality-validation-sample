'use strict';

/**
 * Generates a unique email address for registration tests.
 * @returns {string} A unique email string
 */
const uniqueEmail = () => `testuser_${Date.now()}@automation.example.com`;

const AUTH_PAYLOADS = {
  buildRegisterPayload: (overrides = {}) => ({
    email: uniqueEmail(),
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    ...overrides,
  }),

  REGISTER_DUPLICATE_EMAIL: {
    email: 'lambdatestadmin@email.com',
    password: 'password123',
    firstName: 'A',
    lastName: 'B',
  },

  LOGIN_ADMIN: {
    email: 'lambdatestadmin@email.com',
    password: 'password123',
  },

  LOGIN_HOST_OWNER: {
    email: 'abhishekkumar@lambdatest.com',
    password: 'password123',
  },

  LOGIN_NON_HOST: {
    email: 'testuser@lambdatest.com',
    password: 'password123',
  },

  LOGIN_GUEST: {
    email: 'logintest@lambdatest.com',
    password: 'password123',
  },

  LOGIN_WRONG_PASSWORD: {
    email: 'lambdatestadmin@email.com',
    password: 'wrongpassword',
  },

  LOGIN_NONEXISTENT_EMAIL: {
    email: 'nonexistent@example.com',
    password: 'password123',
  },

  UPDATE_PROFILE: {
    firstName: 'Updated',
    phone: '+1-555-9999',
    bio: 'Updated bio',
  },

  UPDATE_PROFILE_NO_AUTH: {
    firstName: 'Updated',
  },
};

const LISTING_PAYLOADS = {
  CREATE_LISTING: {
    title: 'Test Villa',
    description: 'A test property',
    propertyType: 'Villa',
    price: 300,
    location: {
      address: '123 Test St',
      city: 'Test City',
      state: 'CA',
      country: 'United States',
      zipCode: '90001',
      coordinates: { lat: 34.0, lng: -118.0 },
    },
    amenities: ['WiFi', 'Kitchen'],
    images: ['https://example.com/img.jpg'],
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
  },

  CREATE_LISTING_NO_AUTH: {
    title: 'Test',
    description: 'Test',
    propertyType: 'Apartment',
    price: 100,
    location: {
      address: '123 St',
      city: 'LA',
      state: 'CA',
      country: 'USA',
      zipCode: '90001',
      coordinates: { lat: 34.0, lng: -118.0 },
    },
    amenities: [],
    images: [],
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
  },

  UPDATE_LISTING_PRICE: {
    price: 900,
  },
};

const BOOKING_PAYLOADS = {
  CREATE_BOOKING_GUEST: {
    listingId: '607f1f77bcf86cd799439022',
    checkIn: '2029-01-10',
    checkOut: '2029-01-17',
    guests: 2,
  },

  CREATE_BOOKING_NO_AUTH: {
    listingId: '607f1f77bcf86cd799439021',
    checkIn: '2026-08-01',
    checkOut: '2026-08-07',
    guests: 2,
  },

  buildBookingPayload: (overrides = {}) => ({
    listingId: '607f1f77bcf86cd799439022',
    checkIn: '2028-09-01',
    checkOut: '2028-09-07',
    guests: 2,
    ...overrides,
  }),
};

const REVIEW_PAYLOADS = {
  CREATE_REVIEW_GUEST: {
    listingId: '607f1f77bcf86cd799439022',
    rating: 5,
    comment: 'Great place!',
  },

  CREATE_REVIEW_NO_AUTH: {
    listingId: '607f1f77bcf86cd799439021',
    rating: 5,
    comment: 'Great!',
  },
};

module.exports = {
  AUTH_PAYLOADS,
  LISTING_PAYLOADS,
  BOOKING_PAYLOADS,
  REVIEW_PAYLOADS,
};
