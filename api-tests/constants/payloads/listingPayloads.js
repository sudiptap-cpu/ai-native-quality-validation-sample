/**
 * Payload constants for the listings module.
 */
const listingPayloads = {
  /**
   * Builder for a fresh listing creation payload.
   * Uses Date.now() in the title to avoid duplicate-title issues across runs.
   * @param {Object} overrides - Optional field overrides
   * @returns {Object} Listing creation request body
   */
  buildCreateListingPayload: (overrides = {}) => ({
    title: `Automation Villa ${Date.now()}`,
    description: 'A beautiful automation test property with stunning views.',
    propertyType: 'Villa',
    price: 250,
    location: {
      address: '123 Automation St',
      city: 'TestCity',
      state: 'CA',
      country: 'USA',
      zipCode: '90210',
    },
    amenities: ['WiFi', 'Pool', 'Air Conditioning'],
    images: ['https://example.com/image1.jpg'],
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    ...overrides,
  }),

  /** Fixed payload for the unauthenticated create-listing negative test (scenario_18) */
  CREATE_LISTING_UNAUTH_PAYLOAD: {
    title: 'Test Listing',
    description: 'desc',
    propertyType: 'Villa',
    price: 100,
    location: {
      address: '1 Test St',
      city: 'TestCity',
      state: 'TS',
      country: 'US',
      zipCode: '00000',
    },
    amenities: ['WiFi'],
    images: ['https://test.com/img.jpg'],
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
  },

  /** Partial update payload used for the host-owner update test (scenario_19) */
  UPDATE_LISTING_PAYLOAD: {
    price: 300,
    description: 'Updated description from automation test.',
  },

  /** Partial update payload used in the non-owner 403 test (scenario_20) */
  UPDATE_LISTING_NON_OWNER_PAYLOAD: {
    price: 999,
  },

  /** Partial update payload used in the non-existent listing 404 test (scenario_21) */
  UPDATE_LISTING_NOT_FOUND_PAYLOAD: {
    price: 100,
  },
};

module.exports = { listingPayloads };
