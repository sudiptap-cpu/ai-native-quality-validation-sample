/**
 * Response shape constants for the reviews module.
 * Uses pactum '#type' matchers for runtime type assertions via expectJsonLike.
 */
const reviewResponses = {
  /** Expected error shape when user has no prior confirmed stay (403) */
  CREATE_REVIEW_NO_PRIOR_STAY_RESPONSE: {
    error: 'You can only review listings you have stayed at',
  },

  /** Expected error shape for unauthenticated requests (401) */
  UNAUTH_ERROR_RESPONSE: {
    error: '#string',
  },

  /** Expected shape for GET /api/reviews/listing/:id (200) */
  GET_REVIEWS_FOR_LISTING_RESPONSE: {
    reviews: '#array',
  },
};

module.exports = { reviewResponses };
