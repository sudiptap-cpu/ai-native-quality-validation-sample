'use strict';

const pactum = require('pactum');
const ENDPOINTS = require('../constants/endpoints');
const PAYLOADS = require('../constants/payloads');
const { EXPECTED_MESSAGES, EXPECTED_ERRORS } = require('../constants/responses');
const { login } = require('../helpers/auth.helper');

beforeAll(() => {
  pactum.request.setBaseUrl(global.config.HOST_URL);
});

describe('Auth - Register', () => {
  it('POST /api/auth/register → 201 with new unique email', async () => {
    const uniqueEmail = `newtestuser_${Date.now()}@test.com`;
    await pactum.spec()
      .post(ENDPOINTS.AUTH_REGISTER)
      .withJson({
        email: uniqueEmail,
        password: 'TestPass123!',
        firstName: 'New',
        lastName: 'User',
      })
      .expectStatus(201)
      .expect((ctx) => {
        const body = ctx.res.body;
        expect(body.message).toBeDefined();
        expect(typeof body.token).toBe('string');
        expect(body.user.id).toBeDefined();
        expect(body.user.email).toBe(uniqueEmail);
        expect(typeof body.user.isHost).toBe('boolean');
      });
  });

  it('POST /api/auth/register → 400 with duplicate email', async () => {
    await pactum.spec()
      .post(ENDPOINTS.AUTH_REGISTER)
      .withJson({
        email: 'lambdatestadmin@email.com',
        password: 'TestPass123!',
        firstName: 'Dup',
        lastName: 'User',
      })
      .expectStatus(400)
      .expect((ctx) => {
        expect(ctx.res.body.error).toBe(EXPECTED_ERRORS.EMAIL_ALREADY_REGISTERED);
      });
  });
});

describe('Auth - Login', () => {
  it('POST /api/auth/login → 200 with valid credentials', async () => {
    await pactum.spec()
      .post(ENDPOINTS.AUTH_LOGIN)
      .withJson(PAYLOADS.auth.loginAdmin)
      .expectStatus(200)
      .expect((ctx) => {
        const body = ctx.res.body;
        expect(body.message).toBe(EXPECTED_MESSAGES.LOGIN_SUCCESS);
        expect(typeof body.token).toBe('string');
        expect(body.user.email).toBe('lambdatestadmin@email.com');
      });
  });

  it('POST /api/auth/login → 401 with wrong password', async () => {
    await pactum.spec()
      .post(ENDPOINTS.AUTH_LOGIN)
      .withJson(PAYLOADS.auth.wrongPassword)
      .expectStatus(401)
      .expect((ctx) => {
        expect(ctx.res.body.error).toBe(EXPECTED_ERRORS.INVALID_CREDENTIALS);
      });
  });

  it('POST /api/auth/login → 401 with non-existent user', async () => {
    await pactum.spec()
      .post(ENDPOINTS.AUTH_LOGIN)
      .withJson(PAYLOADS.auth.nonExistentUser)
      .expectStatus(401)
      .expect((ctx) => {
        expect(ctx.res.body.error).toBe(EXPECTED_ERRORS.INVALID_CREDENTIALS);
      });
  });
});

describe('Auth - Profile', () => {
  let adminToken;
  let testUserToken;

  beforeAll(async () => {
    adminToken = await login(
      PAYLOADS.auth.loginAdmin.email,
      PAYLOADS.auth.loginAdmin.password
    );
    testUserToken = await login(
      PAYLOADS.auth.loginTestUser.email,
      PAYLOADS.auth.loginTestUser.password
    );
  });

  it('GET /api/auth/profile → 200 with valid Bearer token', async () => {
    await pactum.spec()
      .get(ENDPOINTS.AUTH_PROFILE)
      .withHeaders('Authorization', `Bearer ${adminToken}`)
      .expectStatus(200)
      .expect((ctx) => {
        const user = ctx.res.body.user;
        expect(user.id).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.firstName).toBeDefined();
        expect(typeof user.isHost).toBe('boolean');
      });
  });

  it('GET /api/auth/profile → 401 with no token', async () => {
    await pactum.spec()
      .get(ENDPOINTS.AUTH_PROFILE)
      .expectStatus(401)
      .expect((ctx) => {
        expect(ctx.res.body.error).toBeDefined();
      });
  });

  it('PUT /api/auth/profile → 200 update phone and bio', async () => {
    await pactum.spec()
      .put(ENDPOINTS.AUTH_PROFILE)
      .withHeaders('Authorization', `Bearer ${testUserToken}`)
      .withJson(PAYLOADS.auth.updateProfile)
      .expectStatus(200)
      .expect((ctx) => {
        const body = ctx.res.body;
        expect(body.message).toBe(EXPECTED_MESSAGES.PROFILE_UPDATED);
        expect(body.user.phone).toBe(PAYLOADS.auth.updateProfile.phone);
        expect(body.user.bio).toBe(PAYLOADS.auth.updateProfile.bio);
      });
  });
});
