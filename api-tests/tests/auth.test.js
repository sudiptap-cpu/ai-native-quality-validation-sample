/**
 * @feature @auth
 * Auth module API tests — registration, login, and profile management.
 */
const pactum = require('pactum');
const { ENDPOINTS } = require('../constants/endpoints');
const { authPayloads } = require('../constants/payloads/authPayloads');
const { authResponses } = require('../constants/responses/authResponses');

describe('Auth API Tests', () => {
  /** Host auth token — captured in beforeAll and used across authenticated tests */
  let hostToken;

  beforeAll(async () => {
    // Obtain the host token once for all authenticated tests in this describe block
    hostToken = await pactum
      .spec()
      .post(ENDPOINTS.AUTH.LOGIN)
      .withJson(authPayloads.LOGIN_HOST_PAYLOAD)
      .expectStatus(200)
      .returns('res.body.token');
    console.log('Auth beforeAll: host token acquired');
  });

  // ---------------------------------------------------------------------------
  // Registration
  // ---------------------------------------------------------------------------

  describe('User Registration', () => {
    it('Should register a new user successfully @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .post(ENDPOINTS.AUTH.REGISTER)
        .withJson(authPayloads.buildRegisterPayload())
        .expectStatus(201)
        .expectJsonLike(authResponses.REGISTER_SUCCESS_RESPONSE);
    });

    it('Should return 400 when registering with an already-registered email @p1 @regression', async () => {
      await pactum
        .spec()
        .post(ENDPOINTS.AUTH.REGISTER)
        .withJson(authPayloads.REGISTER_DUPLICATE_EMAIL_PAYLOAD)
        .expectStatus(400)
        .expectJsonLike(authResponses.REGISTER_DUPLICATE_EMAIL_RESPONSE);
    });
  });

  // ---------------------------------------------------------------------------
  // Login
  // ---------------------------------------------------------------------------

  describe('User Login', () => {
    it('Should login as host user successfully @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .post(ENDPOINTS.AUTH.LOGIN)
        .withJson(authPayloads.LOGIN_HOST_PAYLOAD)
        .expectStatus(200)
        .expectJsonLike(authResponses.LOGIN_HOST_SUCCESS_RESPONSE);
    });

    it('Should login as guest user successfully @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .post(ENDPOINTS.AUTH.LOGIN)
        .withJson(authPayloads.LOGIN_GUEST_PAYLOAD)
        .expectStatus(200)
        .expectJsonLike(authResponses.LOGIN_GUEST_SUCCESS_RESPONSE);
    });

    it('Should return 401 when logging in with invalid credentials @p1 @regression', async () => {
      await pactum
        .spec()
        .post(ENDPOINTS.AUTH.LOGIN)
        .withJson(authPayloads.LOGIN_INVALID_CREDENTIALS_PAYLOAD)
        .expectStatus(401)
        .expectJsonLike(authResponses.LOGIN_INVALID_CREDENTIALS_RESPONSE);
    });
  });

  // ---------------------------------------------------------------------------
  // Profile
  // ---------------------------------------------------------------------------

  describe('User Profile', () => {
    it('Should get authenticated user profile successfully @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.AUTH.PROFILE)
        .withHeaders({ Authorization: 'Bearer ' + hostToken })
        .expectStatus(200)
        .expectJsonLike(authResponses.GET_PROFILE_SUCCESS_RESPONSE);
    });

    it('Should return 401 when getting profile without auth token @p1 @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.AUTH.PROFILE)
        .expectStatus(401)
        .expectJsonLike(authResponses.UNAUTH_ERROR_RESPONSE);
    });

    it('Should update authenticated user profile successfully @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .put(ENDPOINTS.AUTH.PROFILE)
        .withHeaders({ Authorization: 'Bearer ' + hostToken })
        .withJson(authPayloads.UPDATE_PROFILE_PAYLOAD)
        .expectStatus(200)
        .expectJsonLike(authResponses.UPDATE_PROFILE_SUCCESS_RESPONSE);
    });

    it('Should return 401 when updating profile without auth token @p1 @regression', async () => {
      await pactum
        .spec()
        .put(ENDPOINTS.AUTH.PROFILE)
        .withJson(authPayloads.UPDATE_PROFILE_UNAUTH_PAYLOAD)
        .expectStatus(401)
        .expectJsonLike(authResponses.UNAUTH_ERROR_RESPONSE);
    });
  });
});
