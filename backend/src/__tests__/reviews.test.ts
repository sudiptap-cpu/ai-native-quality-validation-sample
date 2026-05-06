import request from 'supertest';
import app from '../app';

jest.setTimeout(30000);

describe('@airbnb_api Reviews Tests', () => {
  let loginTestToken: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'logintest@lambdatest.com', password: 'password123' });
    expect(res.status).toBe(200);
    loginTestToken = res.body.token;
    expect(loginTestToken).toBeDefined();
    expect(loginTestToken).not.toBeNull();
  });

  describe('GET /api/reviews/listing/:listingId', () => {
    it('Should return reviews for a known listing @p0 @sanity @regression', async () => {
      const res = await request(app).get('/api/reviews/listing/607f1f77bcf86cd799439021');

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      expect(Array.isArray(res.body.reviews)).toBe(true);
      expect(res.body.reviews.length).toBeGreaterThan(0);

      const firstReview = res.body.reviews[0];
      expect(firstReview).toBeDefined();
      expect(firstReview).not.toBeNull();

      expect(typeof firstReview.rating).toBe('number');
      expect(firstReview.rating).toBeGreaterThanOrEqual(1);
      expect(firstReview.rating).toBeLessThanOrEqual(5);

      expect(firstReview.userId).toBeDefined();
      expect(firstReview.userId).not.toBeNull();
      expect(typeof firstReview.userId.firstName).toBe('string');
      expect(firstReview.userId.firstName.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/reviews (create)', () => {
    it('Should return 403 when creating a review without a prior stay @p1 @regression', async () => {
      expect(loginTestToken).toBeDefined();
      expect(loginTestToken).not.toBeNull();

      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${loginTestToken}`)
        .send({
          listingId: '607f1f77bcf86cd799439021',
          rating: 5,
          comment: 'Great place!',
        });

      expect(res.status).toBe(403);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();
      expect(res.body.error).toBe('You can only review listings you have stayed at');
    });
  });
});
