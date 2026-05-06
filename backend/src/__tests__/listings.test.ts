import request from 'supertest';
import app from '../app';

jest.setTimeout(30000);

describe('@airbnb_api Listings Tests', () => {
  let adminToken: string;
  let createdListingId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'lambdatestadmin@email.com', password: 'password123' });
    expect(res.status).toBe(200);
    adminToken = res.body.token;
    expect(adminToken).toBeDefined();
    expect(adminToken).not.toBeNull();
  });

  describe('GET /api/listings', () => {
    it('Should return all listings with pagination @p0 @sanity @regression', async () => {
      const res = await request(app).get('/api/listings');

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      expect(Array.isArray(res.body.listings)).toBe(true);
      expect(res.body.listings.length).toBeGreaterThan(0);

      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination).not.toBeNull();
      expect(typeof res.body.pagination.page).toBe('number');
      expect(typeof res.body.pagination.limit).toBe('number');
      expect(typeof res.body.pagination.total).toBe('number');
    });

    it('Should filter listings by city @p1 @regression', async () => {
      const res = await request(app).get('/api/listings?city=Malibu');

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      expect(Array.isArray(res.body.listings)).toBe(true);
      expect(res.body.listings.length).toBeGreaterThan(0);

      const firstListing = res.body.listings[0];
      expect(firstListing.location).toBeDefined();
      expect(firstListing.location).not.toBeNull();
      expect(typeof firstListing.location.city).toBe('string');
      expect(firstListing.location.city).toContain('Malibu');
    });

    it('Should filter listings by propertyType @p1 @regression', async () => {
      const res = await request(app).get('/api/listings?propertyType=Villa');

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      expect(Array.isArray(res.body.listings)).toBe(true);
      expect(res.body.listings.length).toBeGreaterThan(0);
      expect(res.body.listings[0].propertyType).toBe('Villa');
    });

    it('Should filter listings by price range @p1 @regression', async () => {
      const res = await request(app).get('/api/listings?minPrice=200&maxPrice=400');

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      expect(Array.isArray(res.body.listings)).toBe(true);

      res.body.listings.forEach((listing: { price: number }) => {
        expect(listing.price).toBeGreaterThanOrEqual(200);
        expect(listing.price).toBeLessThanOrEqual(400);
      });
    });
  });

  describe('GET /api/listings/:id', () => {
    it('Should return a listing by known ID @p0 @sanity @regression', async () => {
      const res = await request(app).get('/api/listings/607f1f77bcf86cd799439021');

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      expect(res.body.listing).toBeDefined();
      expect(res.body.listing).not.toBeNull();

      expect(res.body.listing._id).toBe('607f1f77bcf86cd799439021');
      expect(typeof res.body.listing.title).toBe('string');
      expect(res.body.listing.title.length).toBeGreaterThan(0);
    });

    it('Should return 404 for unknown listing ID @p1 @regression', async () => {
      const res = await request(app).get('/api/listings/000000000000000000000000');

      expect(res.status).toBe(404);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();
      expect(res.body.error).toBe('Listing not found');
    });
  });

  describe('POST /api/listings (create)', () => {
    it('Should create a listing when authenticated as host @p0 @sanity @regression', async () => {
      expect(adminToken).toBeDefined();
      expect(adminToken).not.toBeNull();

      const res = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Coder Listing',
          description: 'Test description',
          propertyType: 'Apartment',
          price: 150,
          location: {
            address: '123 Test St',
            city: 'Test City',
            state: 'CA',
            country: 'USA',
            zipCode: '90210',
          },
          amenities: ['WiFi', 'Kitchen'],
          images: ['https://example.com/img.jpg'],
          bedrooms: 2,
          bathrooms: 1,
          maxGuests: 4,
        });

      expect(res.status).toBe(201);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      expect(typeof res.body.message).toBe('string');
      expect(res.body.message.length).toBeGreaterThan(0);

      expect(res.body.listing).toBeDefined();
      expect(res.body.listing).not.toBeNull();

      expect(typeof res.body.listing._id).toBe('string');
      expect(res.body.listing._id.length).toBeGreaterThan(0);

      expect(typeof res.body.listing.title).toBe('string');
      expect(res.body.listing.isAvailable).toBe(true);

      createdListingId = res.body.listing._id;
    });

    it('Should return 401 when creating a listing without auth token @p1 @regression', async () => {
      const res = await request(app)
        .post('/api/listings')
        .send({
          title: 'NoAuth Listing',
          description: 'desc',
          propertyType: 'Apartment',
          price: 100,
          location: {
            address: '1 Main St',
            city: 'X',
            state: 'CA',
            country: 'USA',
            zipCode: '00001',
          },
          amenities: ['WiFi'],
          images: ['https://example.com/img.jpg'],
          bedrooms: 1,
          bathrooms: 1,
          maxGuests: 2,
        });

      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();
      expect(typeof res.body.error).toBe('string');
      expect(res.body.error.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/listings/:id (update)', () => {
    it('Should update a listing when authenticated as the host @p1 @regression', async () => {
      expect(adminToken).toBeDefined();
      expect(adminToken).not.toBeNull();
      expect(createdListingId).toBeDefined();
      expect(createdListingId).not.toBeNull();

      const res = await request(app)
        .put(`/api/listings/${createdListingId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Test Listing', price: 200 });

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      expect(typeof res.body.message).toBe('string');
      expect(res.body.message.length).toBeGreaterThan(0);

      expect(res.body.listing).toBeDefined();
      expect(res.body.listing).not.toBeNull();

      expect(typeof res.body.listing._id).toBe('string');
      expect(res.body.listing.title).toBe('Updated Test Listing');
      expect(res.body.listing.price).toBe(200);
    });

    it('Should return 401 when updating a listing without auth token @p1 @regression', async () => {
      const res = await request(app)
        .put('/api/listings/607f1f77bcf86cd799439021')
        .send({ title: 'Unauthorized Update' });

      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();
      expect(typeof res.body.error).toBe('string');
      expect(res.body.error.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/listings/:id', () => {
    it('Should delete a listing when authenticated as the host @p1 @regression', async () => {
      expect(adminToken).toBeDefined();
      expect(adminToken).not.toBeNull();
      expect(createdListingId).toBeDefined();
      expect(createdListingId).not.toBeNull();

      const res = await request(app)
        .delete(`/api/listings/${createdListingId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();
      expect(res.body.message).toBe('Listing deleted successfully');
    });

    it('Should return 401 when deleting a listing without auth token @p1 @regression', async () => {
      const res = await request(app).delete('/api/listings/607f1f77bcf86cd799439021');

      expect(res.status).toBe(401);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();
      expect(typeof res.body.error).toBe('string');
      expect(res.body.error.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/listings/:id/availability', () => {
    it('Should return availability for a known listing ID @p1 @regression', async () => {
      const res = await request(app).get(
        '/api/listings/607f1f77bcf86cd799439021/availability?startDate=2027-01-01&endDate=2027-01-07'
      );

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      expect(typeof res.body.available).toBe('boolean');
      expect(Array.isArray(res.body.blockedDates)).toBe(true);
    });
  });
});
