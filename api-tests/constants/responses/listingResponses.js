/**
 * Response shape constants for the listings module.
 * Uses pactum '#type' matchers for runtime type assertions via expectJsonLike.
 */
const listingResponses = {
  /** Expected shape for GET /api/listings (200) with default pagination */
  GET_ALL_LISTINGS_RESPONSE: {
    listings: '#array',
    pagination: {
      page: '#number',
      limit: '#number',
      total: '#number',
      pages: '#number',
    },
  },

  /** Expected shape for a filtered listings response (200) */
  GET_FILTERED_LISTINGS_RESPONSE: {
    listings: '#array',
    pagination: {
      total: '#number',
    },
  },

  /** Expected shape for GET /api/listings/:id (200) */
  GET_LISTING_BY_ID_RESPONSE: {
    listing: {
      _id: '#string',
      title: '#string',
      price: '#number',
      hostId: {
        _id: '#string',
        firstName: '#string',
      },
    },
    reviews: '#array',
  },

  /** Expected error shape for listing not found (404) */
  LISTING_NOT_FOUND_RESPONSE: {
    error: 'Listing not found',
  },

  /** Expected shape for GET /api/listings/:id/availability (200) */
  GET_AVAILABILITY_RESPONSE: {
    available: '#boolean',
    blockedDates: '#array',
  },

  /** Expected error shape for generic 404 responses */
  GENERIC_NOT_FOUND_RESPONSE: {
    error: '#string',
  },

  /** Expected shape for successful listing creation (201) */
  CREATE_LISTING_SUCCESS_RESPONSE: {
    message: 'Listing created successfully',
    listing: {
      _id: '#string',
      title: '#string',
      price: '#number',
      isAvailable: '#boolean',
    },
  },

  /** Expected error shape for unauthenticated requests (401) */
  UNAUTH_ERROR_RESPONSE: {
    error: '#string',
  },

  /** Expected shape for successful listing update (200) */
  UPDATE_LISTING_SUCCESS_RESPONSE: {
    message: 'Listing updated successfully',
    listing: {
      _id: '#string',
      price: '#number',
    },
  },

  /** Expected error shape when non-owner attempts to update a listing (403) */
  UPDATE_LISTING_FORBIDDEN_RESPONSE: {
    error: 'Not authorized to update this listing',
  },

  /** Expected shape for successful listing deletion (200) */
  DELETE_LISTING_SUCCESS_RESPONSE: {
    message: 'Listing deleted successfully',
  },

  /** Expected error shape for generic 403 responses */
  GENERIC_FORBIDDEN_RESPONSE: {
    error: '#string',
  },
};

module.exports = { listingResponses };
