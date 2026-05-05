/**
 * Response shape constants for the health check endpoint.
 */
const healthResponses = {
  /** Expected shape for GET /health (200) */
  HEALTH_CHECK_RESPONSE: {
    status: 'ok',
    message: 'Server is running',
  },
};

module.exports = { healthResponses };
