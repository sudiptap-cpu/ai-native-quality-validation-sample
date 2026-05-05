/**
 * Response shape constants for the auth module.
 * Uses pactum '#type' matchers for runtime type assertions via expectJsonLike.
 */
const authResponses = {
  /** Expected shape for a successful registration (201) */
  REGISTER_SUCCESS_RESPONSE: {
    message: '#string',
    token: '#string',
    user: {
      id: '#string',
      email: '#string',
      firstName: '#string',
      lastName: '#string',
      isHost: '#boolean',
    },
  },

  /** Expected shape for duplicate-email registration error (400) */
  REGISTER_DUPLICATE_EMAIL_RESPONSE: {
    error: 'Email already registered',
  },

  /** Expected shape for successful host login (200) */
  LOGIN_HOST_SUCCESS_RESPONSE: {
    message: 'Login successful',
    token: '#string',
    user: {
      id: '#string',
      email: '#string',
      firstName: '#string',
      lastName: '#string',
      isHost: '#boolean',
    },
  },

  /** Expected shape for successful guest login (200) */
  LOGIN_GUEST_SUCCESS_RESPONSE: {
    message: 'Login successful',
    token: '#string',
    user: {
      id: '#string',
      email: '#string',
      isHost: '#boolean',
    },
  },

  /** Expected shape for invalid-credentials login error (401) */
  LOGIN_INVALID_CREDENTIALS_RESPONSE: {
    error: 'Invalid credentials',
  },

  /** Expected shape for GET /api/auth/profile (200) */
  GET_PROFILE_SUCCESS_RESPONSE: {
    user: {
      id: '#string',
      email: '#string',
      firstName: '#string',
      lastName: '#string',
      isHost: '#boolean',
    },
  },

  /** Expected shape for unauthenticated profile error (401) */
  UNAUTH_ERROR_RESPONSE: {
    error: '#string',
  },

  /** Expected shape for successful profile update (200) */
  UPDATE_PROFILE_SUCCESS_RESPONSE: {
    message: 'Profile updated successfully',
    user: {
      id: '#string',
      email: '#string',
      firstName: '#string',
      lastName: '#string',
      isHost: '#boolean',
    },
  },
};

module.exports = { authResponses };
