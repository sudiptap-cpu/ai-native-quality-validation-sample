import request from 'supertest';
import app from '../app';

jest.setTimeout(30000);

describe('@airbnb_api Health Check Tests', () => {
  describe('GET /health', () => {
    it('Should return 200 with status ok for health check @p0 @sanity @regression', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);

      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      expect(typeof res.body.status).toBe('string');
      expect(res.body.status).toBe('ok');

      expect(typeof res.body.message).toBe('string');
      expect(res.body.message.length).toBeGreaterThan(0);
    });
  });
});
