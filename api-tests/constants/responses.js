'use strict';

const KNOWN_IDS = {
  // Users
  ADMIN_USER_ID: '507f1f77bcf86cd799439010',
  ABHISHEK_USER_ID: '507f1f77bcf86cd799439011',
  TEST_USER_ID: '507f1f77bcf86cd799439017',
  EMMA_DAVIS_USER_ID: '507f1f77bcf86cd799439013',
  LOGINTEST_USER_ID: '507f1f77bcf86cd799439016',

  // Listings
  MALIBU_VILLA_ID: '607f1f77bcf86cd799439021',
  SCOTTSDALE_VILLA_ID: '607f1f77bcf86cd799439028',
  ZERO_LISTING_ID: '000000000000000000000000',

  // Bookings
  EMMA_BOOKING_ID: '707f1f77bcf86cd799439031',
  ZERO_BOOKING_ID: '000000000000000000000000',
};

const EXPECTED_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  LISTING_CREATED: 'Listing created successfully',
  LISTING_UPDATED: 'Listing updated successfully',
  LISTING_DELETED: 'Listing deleted successfully',
  BOOKING_CREATED: 'Booking created successfully',
  BOOKING_CANCELLED: 'Booking cancelled successfully',
  REVIEW_CREATED: 'Review created successfully',
};

const EXPECTED_ERRORS = {
  EMAIL_ALREADY_REGISTERED: 'Email already registered',
  INVALID_CREDENTIALS: 'Invalid credentials',
  LISTING_NOT_FOUND: 'Listing not found',
  BOOKING_NOT_FOUND: 'Booking not found',
  NOT_AUTHORIZED_UPDATE_LISTING: 'Not authorized to update this listing',
  NOT_AUTHORIZED_DELETE_LISTING: 'Not authorized to delete this listing',
  NOT_AUTHORIZED_CANCEL_BOOKING: 'Not authorized to cancel this booking',
  REVIEW_ELIGIBILITY: 'You can only review listings you have stayed at',
  ALREADY_REVIEWED: 'You have already reviewed this listing',
  LISTING_NOT_AVAILABLE: 'Listing not available for selected dates',
};

module.exports = { KNOWN_IDS, EXPECTED_MESSAGES, EXPECTED_ERRORS };
