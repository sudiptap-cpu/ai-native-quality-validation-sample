import request from 'supertest';
import { createApp, getAuthToken } from './helpers/testApp';

const app = createApp();

describe('Reviews API', () => {
  let emmaDavisToken: string;
  let testUserToken: string;

  beforeAll(async () => {
    emmaDavisToken = await getAuthToken(app, 'emma.davis@email.com', 'password123');
    testUserToken = await getAuthToken(app, 'testuser@lambdatest.com', 'password123');
  });

  // scenario_46
  it('Should create a review for a completed and confirmed booking @p0 @sanity @regression', async () => {
    // emma.davis has booking 033 for listing 024 with checkOut 2024-12-27 (past date), status confirmed
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${emmaDavisToken}`)
      .send({
        listingId: '607f1f77bcf86cd799439024',
        rating: 5,
        comment: 'Great stay!',
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Review created successfully');
    expect(typeof res.body.review._id).toBe('string');
    expect(res.body.review.listingId).toBe('607f1f77bcf86cd799439024');
    expect(res.body.review.userId).toBe('507f1f77bcf86cd799439013');
    expect(res.body.review.rating).toBe(5);
    expect(res.body.review.comment).toBe('Great stay!');
  });

  // scenario_47 — emma.davis already has review 807f1f77bcf86cd799439041 for listing 021 in base mock data
  it('Should return 400 when creating a duplicate review @p1 @regression', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${emmaDavisToken}`)
      .send({
        listingId: '607f1f77bcf86cd799439021',
        rating: 4,
        comment: 'Again great!',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('You have already reviewed this listing');
  });

  // scenario_48
  it('Should return 403 when creating a review without a qualifying booking @p1 @regression', async () => {
    // testuser has no bookings for listing 022
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({
        listingId: '607f1f77bcf86cd799439022',
        rating: 4,
        comment: 'Nice place',
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('You can only review listings you have stayed at');
  });

  // scenario_49
  it('Should return 401 when creating a review without token @p1 @regression', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({
        listingId: '607f1f77bcf86cd799439021',
        rating: 5,
        comment: 'Great!',
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  // scenario_50
  it('Should get reviews for a listing with existing reviews @p0 @sanity @regression', async () => {
    const res = await request(app).get(
      '/api/reviews/listing/607f1f77bcf86cd799439021'
    );

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.reviews)).toBe(true);
    expect(res.body.reviews.length).toBeGreaterThan(0);
    expect(typeof res.body.reviews[0]._id).toBe('string');
    expect(res.body.reviews[0].listingId).toBe('607f1f77bcf86cd799439021');
    expect(typeof res.body.reviews[0].userId._id).toBe('string');
    expect(typeof res.body.reviews[0].userId.firstName).toBe('string');
    expect(typeof res.body.reviews[0].userId.lastName).toBe('string');
    expect(typeof res.body.reviews[0].userId.avatar).toBe('string');
    expect(typeof res.body.reviews[0].rating).toBe('number');
    expect(typeof res.body.reviews[0].comment).toBe('string');
  });

  // scenario_51
  it('Should return empty array for a listing with no reviews @p2 @regression', async () => {
    const res = await request(app).get(
      '/api/reviews/listing/607f1f77bcf86cd799439029'
    );

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.reviews)).toBe(true);
    expect(res.body.reviews.length).toBe(0);
  });
});
