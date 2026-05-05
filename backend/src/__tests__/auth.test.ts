import request from 'supertest';
import { createApp, getAuthToken } from './helpers/testApp';

const app = createApp();

describe('Auth API', () => {
  let testUserToken: string;

  beforeAll(async () => {
    testUserToken = await getAuthToken(app, 'testuser@lambdatest.com', 'password123');
  });

  // scenario_1
  it('Should register a new user successfully @p0 @sanity @regression', async () => {
    const email = `newuser_${Date.now()}@test.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email,
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User',
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
    expect(typeof res.body.token).toBe('string');
    expect(typeof res.body.user.id).toBe('string');
    expect(typeof res.body.user.email).toBe('string');
    expect(typeof res.body.user.firstName).toBe('string');
    expect(typeof res.body.user.lastName).toBe('string');
    expect(typeof res.body.user.avatar).toBe('string');
    expect(res.body.user.isHost).toBe(false);
  });

  // scenario_2
  it('Should return 400 when registering with an already-registered email @p1 @regression', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'lambdatestadmin@email.com',
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email already registered');
  });

  // scenario_3
  it('Should login a known user successfully @p0 @sanity @regression', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@lambdatest.com',
        password: 'password123',
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Login successful');
    expect(typeof res.body.token).toBe('string');
    expect(typeof res.body.user.id).toBe('string');
    expect(res.body.user.email).toBe('testuser@lambdatest.com');
    expect(res.body.user.isHost).toBe(false);
  });

  // scenario_4
  it('Should return 401 for login with wrong password @p1 @regression', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@lambdatest.com',
        password: 'wrongpassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  // scenario_5
  it('Should return 401 for login with unknown email @p1 @regression', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nobody@unknown.com',
        password: 'password123',
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  // scenario_6
  it('Should get authenticated user profile @p0 @sanity @regression', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${testUserToken}`);

    expect(res.status).toBe(200);
    expect(typeof res.body.user.id).toBe('string');
    expect(res.body.user.email).toBe('testuser@lambdatest.com');
    expect(typeof res.body.user.firstName).toBe('string');
    expect(typeof res.body.user.lastName).toBe('string');
    expect(typeof res.body.user.avatar).toBe('string');
    expect(typeof res.body.user.phone).toBe('string');
    expect(typeof res.body.user.bio).toBe('string');
    expect(res.body.user.isHost).toBe(false);
  });

  // scenario_7
  it('Should return 401 when getting profile without token @p1 @regression', async () => {
    const res = await request(app).get('/api/auth/profile');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  // scenario_8
  it('Should return 401 when getting profile with invalid token @p1 @regression', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer invalidtoken123');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid or expired token');
  });

  // scenario_9
  it('Should update authenticated user profile @p1 @regression', async () => {
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ bio: 'Updated bio text' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Profile updated successfully');
    expect(typeof res.body.user.id).toBe('string');
    expect(res.body.user.email).toBe('testuser@lambdatest.com');
    expect(res.body.user.bio).toBe('Updated bio text');
  });

  // scenario_10
  it('Should return 401 when updating profile without token @p1 @regression', async () => {
    const res = await request(app)
      .put('/api/auth/profile')
      .send({ bio: 'test' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });
});
