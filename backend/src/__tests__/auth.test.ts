import request from 'supertest';
import app from '../app';

jest.setTimeout(30000);

describe('@airbnb_api Auth Tests', () => {
  let testUserToken: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser@lambdatest.com', password: 'password123' });
    expect(res.status).toBe(200);
    testUserToken = res.body.token;
    expect(testUserToken).toBeDefined();
    expect(testUserToken).not.toBeNull();
  });

  describe('Register', () => {
    it('Should register a new user successfully @p0 @sanity @regression', async () => {
      const uniqueEmail = `testregistrant_${Date.now()}@example.com`;

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: uniqueEmail,
          password: 'password123',
          firstName: 'Test',
          lastName: 'Registrant',
        });

      expect(res.status).toBe(201);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      expect(typeof res.body.message).toBe('string');
      expect(res.body.message.length).toBeGreaterThan(0);

      expect(typeof res.body.token).toBe('string');
      expect(res.body.token.length).toBeGreaterThan(0);

      expect(res.body.user).toBeDefined();
      expect(res.body.user).not.toBeNull();

      expect(typeof res.body.user.id).toBe('string');
      expect(typeof res.body.user.email).toBe('string');
      expect(res.body.user.email).toBe(uniqueEmail);
      expect(typeof res.body.user.firstName).toBe('string');
      expect(res.body.user.firstName).toBe('Test');
      expect(typeof res.body.user.lastName).toBe('string');
      expect(res.body.user.lastName).toBe('Registrant');
      expect(typeof res.body.user.isHost).toBe('boolean');
    });

    it('Should return 400 when registering with an already registered email @p1 @regression', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'testuser@lambdatest.com',
          password: 'password123',
          firstName: 'Dup',
          lastName: 'User',
        });

      expect(res.status).toBe(400);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();
      expect(res.body.error).toBe('Email already registered');
    });
  });

  describe('Login', () => {
    it('Should login successfully with valid credentials @p0 @sanity @regression', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'testuser@lambdatest.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      expect(typeof res.body.message).toBe('string');
      expect(res.body.message.length).toBeGreaterThan(0);

      expect(typeof res.body.token).toBe('string');
      expect(res.body.token.length).toBeGreaterThan(0);

      expect(res.body.user).toBeDefined();
      expect(res.body.user).not.toBeNull();

      expect(typeof res.body.user.id).toBe('string');
      expect(typeof res.body.user.email).toBe('string');
      expect(res.body.user.email).toBe('testuser@lambdatest.com');
      expect(typeof res.body.user.isHost).toBe('boolean');
    });

    it('Should return 401 when logging in with wrong password @p1 @regression', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'testuser@lambdatest.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('Should return 401 when logging in with unknown email @p1 @regression', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();
      expect(res.body.error).toBe('Invalid credentials');
    });
  });

  describe('Profile', () => {
    it('Should return profile for authenticated user @p0 @sanity @regression', async () => {
      expect(testUserToken).toBeDefined();
      expect(testUserToken).not.toBeNull();

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      expect(res.body.user).toBeDefined();
      expect(res.body.user).not.toBeNull();

      expect(typeof res.body.user.id).toBe('string');
      expect(res.body.user.id.length).toBeGreaterThan(0);

      expect(typeof res.body.user.email).toBe('string');
      expect(res.body.user.email).toBe('testuser@lambdatest.com');

      expect(typeof res.body.user.firstName).toBe('string');
      expect(typeof res.body.user.isHost).toBe('boolean');
    });

    it('Should return 401 when getting profile without auth token @p1 @regression', async () => {
      const res = await request(app).get('/api/auth/profile');

      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      expect(typeof res.body.error).toBe('string');
      expect(res.body.error.length).toBeGreaterThan(0);
    });

    it('Should update profile fields successfully @p1 @regression', async () => {
      expect(testUserToken).toBeDefined();
      expect(testUserToken).not.toBeNull();

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ firstName: 'Updated', lastName: 'Name', bio: 'Updated bio' });

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      expect(typeof res.body.message).toBe('string');
      expect(res.body.message.length).toBeGreaterThan(0);

      expect(res.body.user).toBeDefined();
      expect(res.body.user).not.toBeNull();

      expect(typeof res.body.user.id).toBe('string');
      expect(res.body.user.firstName).toBe('Updated');
      expect(res.body.user.lastName).toBe('Name');
    });
  });
});
