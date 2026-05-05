/**
 * Payload constants for the reviews module.
 */
const reviewPayloads = {
  /**
   * Review creation payload targeting the Malibu Villa seed listing.
   * Expected to return 403 because the test user has no prior confirmed stay.
   */
  CREATE_REVIEW_NO_PRIOR_STAY_PAYLOAD: {
    listingId: '607f1f77bcf86cd799439021',
    rating: 5,
    comment: 'Great place!',
  },

  /**
   * Review creation payload used in the unauthenticated negative test (scenario_34).
   */
  CREATE_REVIEW_UNAUTH_PAYLOAD: {
    listingId: '607f1f77bcf86cd799439021',
    rating: 5,
    comment: 'Great place!',
  },
};

module.exports = { reviewPayloads };
