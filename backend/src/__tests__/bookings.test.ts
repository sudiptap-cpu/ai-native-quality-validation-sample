import request from 'supertest';
import app from '../app';

jest.setTimeout(30000);

describe('@airbnb_api Bookings Tests', () => {
  let testUserToken: string;
  let loginTestToken: string;
  let abhishekToken: string;
  let emmaDavisToken: string;
  let createdBookingId: string;

  beforeAll(async () => {
    const testUserRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser@lambdatest.com', password: 'password123' });
    expect(testUserRes.status).toBe(200);
    testUserToken = testUserRes.body.token;
    expect(testUserToken).toBeDefined();
    expect(testUserToken).not.toBeNull();

    const loginTestRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'logintest@lambdatest.com', password: 'password123' });
    expect(loginTestRes.status).toBe(200);
    loginTestToken = loginTestRes.body.token;
    expect(loginTestToken).toBeDefined();
    expect(loginTestToken).not.toBeNull();

    const abhishekRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'abhishekkumar@lambdatest.com', password: 'password123' });
    expect(abhishekRes.status).toBe(200);
    abhishekToken = abhishekRes.body.token;
    expect(abhishekToken).toBeDefined();
    expect(abhishekToken).not.toBeNull();

    const emmaRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'emma.davis@email.com', password: 'password123' });
    expect(emmaRes.status).toBe(200);
    emmaDavisToken = emmaRes.body.token;
    expect(emmaDavisToken).toBeDefined();
    expect(emmaDavisToken).not.toBeNull();
  });

  describe('POST /api/bookings (create)', () => {
    it('Should create a booking for a valid listing @p0 @sanity @regression', async () => {
      expect(testUserToken).toBeDefined();
      expect(testUserToken).not.toBeNull();

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          listingId: '607f1f77bcf86cd799439026',
          checkIn: '2027-03-01',
          checkOut: '2027-03-05',
          guests: 2,
        });

      expect(res.status).toBe(201);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      expect(typeof res.body.message).toBe('string');
      expect(res.body.message.length).toBeGreaterThan(0);

      expect(res.body.booking).toBeDefined();
      expect(res.body.booking).not.toBeNull();

      expect(typeof res.body.booking._id).toBe('string');
      expect(res.body.booking._id.length).toBeGreaterThan(0);

      expect(res.body.booking.status).toBe('confirmed');

      expect(typeof res.body.booking.totalPrice).toBe('number');
      expect(res.body.booking.totalPrice).toBeGreaterThan(0);

      createdBookingId = res.body.booking._id;
    });

    it('Should return 404 when creating a booking for a non-existent listing @p1 @regression', async () => {
      expect(testUserToken).toBeDefined();
      expect(testUserToken).not.toBeNull();

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          listingId: '000000000000000000000000',
          checkIn: '2027-04-01',
          checkOut: '2027-04-05',
          guests: 2,
        });

      expect(res.status).toBe(404);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();
      expect(res.body.error).toBe('Listing not found');
    });
  });

  describe('GET /api/bookings/user', () => {
    it('Should return user bookings for authenticated guest @p0 @sanity @regression', async () => {
      expect(emmaDavisToken).toBeDefined();
      expect(emmaDavisToken).not.toBeNull();

      const res = await request(app)
        .get('/api/bookings/user')
        .set('Authorization', `Bearer ${emmaDavisToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();
      expect(Array.isArray(res.body.bookings)).toBe(true);
    });
  });

  describe('GET /api/bookings/host', () => {
    it('Should return host bookings for authenticated host @p0 @sanity @regression', async () => {
      expect(abhishekToken).toBeDefined();
      expect(abhishekToken).not.toBeNull();

      const res = await request(app)
        .get('/api/bookings/host')
        .set('Authorization', `Bearer ${abhishekToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      expect(Array.isArray(res.body.bookings)).toBe(true);
      expect(res.body.bookings.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/bookings/:id/cancel', () => {
    it('Should cancel a booking successfully when authorized @p1 @regression', async () => {
      expect(testUserToken).toBeDefined();
      expect(testUserToken).not.toBeNull();
      expect(createdBookingId).toBeDefined();
      expect(createdBookingId).not.toBeNull();

      const res = await request(app)
        .put(`/api/bookings/${createdBookingId}/cancel`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      expect(res.body.message).toBe('Booking cancelled successfully');

      expect(res.body.booking).toBeDefined();
      expect(res.body.booking).not.toBeNull();
      expect(res.body.booking.status).toBe('cancelled');
    });

    it('Should return 403 when cancelling a booking as unauthorized user @p1 @regression', async () => {
      expect(loginTestToken).toBeDefined();
      expect(loginTestToken).not.toBeNull();

      const res = await request(app)
        .put('/api/bookings/707f1f77bcf86cd799439032/cancel')
        .set('Authorization', `Bearer ${loginTestToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();
      expect(res.body.error).toBe('Not authorized to cancel this booking');
    });

    it('Should return 404 when cancelling a non-existent booking @p1 @regression', async () => {
      expect(testUserToken).toBeDefined();
      expect(testUserToken).not.toBeNull();

      const res = await request(app)
        .put('/api/bookings/000000000000000000000000/cancel')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();
      expect(res.body.error).toBe('Booking not found');
    });
  });
});
