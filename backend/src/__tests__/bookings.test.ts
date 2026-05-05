import request from 'supertest';
import { createApp, getAuthToken } from './helpers/testApp';

const app = createApp();

describe('Bookings API', () => {
  let testUserToken: string;
  let emmaDavisToken: string;
  let michaelChenToken: string;
  let loginTestToken: string;

  beforeAll(async () => {
    testUserToken = await getAuthToken(app, 'testuser@lambdatest.com', 'password123');
    emmaDavisToken = await getAuthToken(app, 'emma.davis@email.com', 'password123');
    michaelChenToken = await getAuthToken(app, 'michael.chen@email.com', 'password123');
    loginTestToken = await getAuthToken(app, 'logintest@lambdatest.com', 'password123');
  });

  // scenario_32
  it('Should create a booking for an available listing @p0 @sanity @regression', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({
        listingId: '607f1f77bcf86cd799439022',
        checkIn: '2026-08-01',
        checkOut: '2026-08-05',
        guests: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Booking created successfully');
    expect(typeof res.body.booking._id).toBe('string');
    expect(res.body.booking.listingId).toBe('607f1f77bcf86cd799439022');
    expect(res.body.booking.guestId).toBe('507f1f77bcf86cd799439017');
    expect(res.body.booking.totalPrice).toBe(1280);
    expect(res.body.booking.status).toBe('confirmed');
  });

  // scenario_33
  it('Should return 400 when booking dates conflict with an existing booking @p1 @regression', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({
        listingId: '607f1f77bcf86cd799439021',
        checkIn: '2024-11-16',
        checkOut: '2024-11-19',
        guests: 2,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Listing not available for selected dates');
  });

  // scenario_34
  it('Should return 404 when booking a non-existent listing @p1 @regression', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({
        listingId: '000000000000000000000000',
        checkIn: '2026-08-01',
        checkOut: '2026-08-05',
        guests: 2,
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Listing not found');
  });

  // scenario_35
  it('Should return 401 when creating a booking without token @p1 @regression', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({
        listingId: '607f1f77bcf86cd799439022',
        checkIn: '2026-09-01',
        checkOut: '2026-09-03',
        guests: 1,
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  // scenario_36
  it('Should get bookings for the authenticated user (guest) @p0 @sanity @regression', async () => {
    const res = await request(app)
      .get('/api/bookings/user')
      .set('Authorization', `Bearer ${emmaDavisToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.bookings)).toBe(true);
    expect(res.body.bookings.length).toBeGreaterThan(0);
    expect(typeof res.body.bookings[0]._id).toBe('string');
    expect(typeof res.body.bookings[0].listingId).toBe('string');
    expect(typeof res.body.bookings[0].listing).toBe('object');
    expect(typeof res.body.bookings[0].listing.title).toBe('string');
    expect(typeof res.body.bookings[0].status).toBe('string');
  });

  // scenario_37
  it('Should return empty bookings array when user has no bookings @p2 @regression', async () => {
    const res = await request(app)
      .get('/api/bookings/user')
      .set('Authorization', `Bearer ${loginTestToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.bookings)).toBe(true);
    expect(res.body.bookings.length).toBe(0);
  });

  // scenario_38
  it('Should return 401 when getting user bookings without token @p1 @regression', async () => {
    const res = await request(app).get('/api/bookings/user');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  // scenario_39
  it('Should get bookings for the authenticated host @p1 @regression', async () => {
    const abhishekToken = await getAuthToken(app, 'abhishekkumar@lambdatest.com', 'password123');
    const res = await request(app)
      .get('/api/bookings/host')
      .set('Authorization', `Bearer ${abhishekToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.bookings)).toBe(true);
    expect(res.body.bookings.length).toBeGreaterThan(0);
    expect(typeof res.body.bookings[0]._id).toBe('string');
    expect(typeof res.body.bookings[0].hostId).toBe('string');
    expect(typeof res.body.bookings[0].listing).toBe('object');
  });

  // scenario_40
  it('Should return 401 when getting host bookings without token @p1 @regression', async () => {
    const res = await request(app).get('/api/bookings/host');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  // scenario_41
  it('Should cancel a booking as the guest @p1 @regression', async () => {
    const res = await request(app)
      .put('/api/bookings/707f1f77bcf86cd799439031/cancel')
      .set('Authorization', `Bearer ${emmaDavisToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Booking cancelled successfully');
    expect(res.body.booking.status).toBe('cancelled');
  });

  // scenario_42
  it('Should cancel a booking as the host @p2 @regression', async () => {
    const res = await request(app)
      .put('/api/bookings/707f1f77bcf86cd799439032/cancel')
      .set('Authorization', `Bearer ${michaelChenToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Booking cancelled successfully');
    expect(res.body.booking.status).toBe('cancelled');
  });

  // scenario_43
  it('Should return 403 when cancelling a booking as an unrelated user @p1 @regression', async () => {
    const res = await request(app)
      .put('/api/bookings/707f1f77bcf86cd799439033/cancel')
      .set('Authorization', `Bearer ${loginTestToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Not authorized to cancel this booking');
  });

  // scenario_44
  it('Should return 404 when cancelling a non-existent booking @p2 @regression', async () => {
    const res = await request(app)
      .put('/api/bookings/000000000000000000000000/cancel')
      .set('Authorization', `Bearer ${emmaDavisToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Booking not found');
  });

  // scenario_45
  it('Should return 401 when cancelling a booking without token @p1 @regression', async () => {
    const res = await request(app)
      .put('/api/bookings/707f1f77bcf86cd799439031/cancel');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });
});
