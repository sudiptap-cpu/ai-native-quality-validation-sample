/**
 * Payload constants for the auth module.
 * Dynamic unique fields (e.g. registration email) use Date.now() to avoid conflicts.
 */
const authPayloads = {
  /**
   * Builder for a fresh registration payload.
   * Uses a timestamp-based email to ensure uniqueness across test runs.
   * @param {Object} overrides - Optional field overrides
   * @returns {Object} Registration request body
   */
  buildRegisterPayload: (overrides = {}) => ({
    email: `test_${Date.now()}@automation.com`,
    password: 'AutoPass123!',
    firstName: 'AutoFirst',
    lastName: 'AutoLast',
    ...overrides,
  }),

  /** Registration attempt with a known-duplicate seed email — expects 400 */
  REGISTER_DUPLICATE_EMAIL_PAYLOAD: {
    email: 'lambdatestadmin@email.com',
    password: 'AutoPass123!',
    firstName: 'AutoFirst',
    lastName: 'AutoLast',
  },

  /** Login payload for the primary host user (lambdatestadmin) */
  LOGIN_HOST_PAYLOAD: {
    email: 'lambdatestadmin@email.com',
    password: 'password123',
  },

  /** Login payload for the guest user */
  LOGIN_GUEST_PAYLOAD: {
    email: 'testuser@lambdatest.com',
    password: 'password123',
  },

  /** Login payload with invalid credentials — expects 401 */
  LOGIN_INVALID_CREDENTIALS_PAYLOAD: {
    email: 'lambdatestadmin@email.com',
    password: 'wrongpassword',
  },

  /** Login payload for the listing owner (abhishekkumar) */
  LOGIN_LISTING_OWNER_PAYLOAD: {
    email: 'abhishekkumar@lambdatest.com',
    password: 'password123',
  },

  /** Profile update payload with all optional fields populated */
  UPDATE_PROFILE_PAYLOAD: {
    firstName: 'UpdatedFirst',
    lastName: 'UpdatedLast',
    phone: '+1-555-0100',
    bio: 'Automation test bio.',
    avatar: 'https://example.com/avatar.png',
  },

  /** Minimal profile update payload used in unauthenticated negative test */
  UPDATE_PROFILE_UNAUTH_PAYLOAD: {
    firstName: 'ShouldFail',
  },
};

module.exports = { authPayloads };
