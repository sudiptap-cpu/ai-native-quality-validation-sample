'use strict';

const pactum = require('pactum');
const { BASE_URL } = require('../config/base');
const { ENDPOINTS } = require('../constants/endpoints');
const { AUTH_PAYLOADS } = require('../constants/payloads');
const { login, bearerHeader } = require('../helpers/auth.helper');

describe('@airbnb_api Auth', () => {
  beforeAll(() => {
    pactum.request.setBaseUrl(BASE_URL);
  });

  let adminToken;

  describe('Register', () => {
    it('Should register a new user successfully @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .post(ENDPOINTS.AUTH_REGISTER)
        .withJson(AUTH_PAYLOADS.buildRegisterPayload())
        .expectStatus(201)
        .expectJsonLike({
          message: /\w+/,
          token: /\w+/,
          user: {
            email: /\w+/,
            isHost: false,
          },
        });
    });

    it('Should return 400 when registering with duplicate email @p1 @regression', async () => {
      await pactum
        .spec()
        .post(ENDPOINTS.AUTH_REGISTER)
        .withJson(AUTH_PAYLOADS.REGISTER_DUPLICATE_EMAIL)
        .expectStatus(400);
    });
  });

  describe('Login', () => {
    it('Should login with valid credentials @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .post(ENDPOINTS.AUTH_LOGIN)
        .withJson(AUTH_PAYLOADS.LOGIN_ADMIN)
        .expectStatus(200)
        .expectJsonLike({
          message: /\w+/,
          token: /\w+/,
          user: {
            email: 'lambdatestadmin@email.com',
            isHost: true,
          },
        });
    });

    it('Should return 401 when login with wrong password @p1 @regression', async () => {
      await pactum
        .spec()
        .post(ENDPOINTS.AUTH_LOGIN)
        .withJson(AUTH_PAYLOADS.LOGIN_WRONG_PASSWORD)
        .expectStatus(401);
    });

    it('Should return 401 when login with non-existent email @p1 @regression', async () => {
      await pactum
        .spec()
        .post(ENDPOINTS.AUTH_LOGIN)
        .withJson(AUTH_PAYLOADS.LOGIN_NONEXISTENT_EMAIL)
        .expectStatus(401);
    });
  });

  describe('Profile', () => {
    beforeAll(async () => {
      adminToken = await login(
        AUTH_PAYLOADS.LOGIN_ADMIN.email,
        AUTH_PAYLOADS.LOGIN_ADMIN.password
      );
    });

    it('Should get authenticated user profile @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.AUTH_PROFILE)
        .withHeaders({ Authorization: bearerHeader(adminToken) })
        .expectStatus(200)
        .expectJsonLike({
          user: {
            id: /\w+/,
            email: /\w+/,
            isHost: true,
          },
        });
    });

    it('Should return 401 when getting profile without token @p1 @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.AUTH_PROFILE)
        .expectStatus(401);
    });

    it('Should return 401 when getting profile with invalid token @p1 @regression', async () => {
      await pactum
        .spec()
        .get(ENDPOINTS.AUTH_PROFILE)
        .withHeaders({ Authorization: 'Bearer invalidtoken' })
        .expectStatus(401);
    });

    it('Should update authenticated user profile @p0 @sanity @regression', async () => {
      await pactum
        .spec()
        .put(ENDPOINTS.AUTH_PROFILE)
        .withHeaders({ Authorization: bearerHeader(adminToken) })
        .withJson(AUTH_PAYLOADS.UPDATE_PROFILE)
        .expectStatus(200)
        .expectJsonLike({
          message: /\w+/,
          user: {
            firstName: 'Updated',
          },
        });
    });

    it('Should return 401 when updating profile without token @p1 @regression', async () => {
      await pactum
        .spec()
        .put(ENDPOINTS.AUTH_PROFILE)
        .withJson(AUTH_PAYLOADS.UPDATE_PROFILE_NO_AUTH)
        .expectStatus(401);
    });
  });
});
