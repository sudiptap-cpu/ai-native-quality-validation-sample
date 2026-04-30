import request from 'supertest';
import { createApp, getAuthToken } from './helpers/testApp';

const app = createApp();

describe('Listings API', () => {
  let abhishekToken: string;
  let michaelToken: string;

  beforeAll(async () => {
    abhishekToken = await getAuthToken(app, 'abhishekkumar@lambdatest.com', 'password123');
    michaelToken = await getAuthToken(app, 'michael.chen@email.com', 'password123');
  });

  // scenario_11
  it('Should get all listings without filters @p0 @sanity @regression', async () => {
    const res = await request(app).get('/api/listings');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.listings)).toBe(true);
    expect(res.body.listings.length).toBeGreaterThan(0);
    expect(typeof res.body.listings[0]._id).toBe('string');
    expect(typeof res.body.listings[0].title).toBe('string');
    expect(typeof res.body.listings[0].price).toBe('number');
    expect(typeof res.body.listings[0].location).toBe('object');
    expect(typeof res.body.listings[0].hostId).toBe('object');
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(20);
    expect(res.body.pagination.total).toBeGreaterThan(0);
    expect(typeof res.body.pagination.pages).toBe('number');
  });

  // scenario_12
  it('Should filter listings by city @p1 @regression', async () => {
    const res = await request(app).get('/api/listings?city=Malibu');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.listings)).toBe(true);
    expect(res.body.listings.length).toBeGreaterThan(0);
    res.body.listings.forEach((listing: any) => {
      expect(listing.location.city.toLowerCase()).toContain('malibu');
    });
    expect(res.body.pagination.total).toBeGreaterThan(0);
  });

  // scenario_13
  it('Should filter listings by propertyType @p1 @regression', async () => {
    const res = await request(app).get('/api/listings?propertyType=Villa');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.listings)).toBe(true);
    expect(res.body.listings.length).toBeGreaterThan(0);
    res.body.listings.forEach((listing: any) => {
      expect(listing.propertyType).toBe('Villa');
    });
    expect(res.body.pagination.total).toBeGreaterThan(0);
  });

  // scenario_14
  it('Should filter listings by minPrice and maxPrice @p1 @regression', async () => {
    const res = await request(app).get('/api/listings?minPrice=200&maxPrice=400');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.listings)).toBe(true);
    expect(typeof res.body.pagination.total).toBe('number');
    res.body.listings.forEach((listing: any) => {
      expect(listing.price).toBeGreaterThanOrEqual(200);
      expect(listing.price).toBeLessThanOrEqual(400);
    });
  });

  // scenario_15
  it('Should filter listings by guests @p2 @regression', async () => {
    const res = await request(app).get('/api/listings?guests=6');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.listings)).toBe(true);
    expect(typeof res.body.pagination.total).toBe('number');
    res.body.listings.forEach((listing: any) => {
      expect(listing.maxGuests).toBeGreaterThanOrEqual(6);
    });
  });

  // scenario_16
  it('Should paginate listings with page and limit @p2 @regression', async () => {
    const res = await request(app).get('/api/listings?page=1&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.listings.length).toBeLessThanOrEqual(5);
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(5);
    expect(typeof res.body.pagination.total).toBe('number');
    expect(typeof res.body.pagination.pages).toBe('number');
  });

  // scenario_17
  it('Should get listing by ID @p0 @sanity @regression', async () => {
    const res = await request(app).get('/api/listings/607f1f77bcf86cd799439021');

    expect(res.status).toBe(200);
    expect(res.body.listing._id).toBe('607f1f77bcf86cd799439021');
    expect(res.body.listing.title).toBe('Stunning Oceanfront Villa in Malibu');
    expect(res.body.listing.price).toBe(850);
    expect(typeof res.body.listing.location).toBe('object');
    expect(Array.isArray(res.body.listing.amenities)).toBe(true);
    expect(res.body.listing.bedrooms).toBe(4);
    expect(res.body.listing.bathrooms).toBe(3);
    expect(res.body.listing.maxGuests).toBe(8);
    expect(typeof res.body.listing.hostId._id).toBe('string');
    expect(typeof res.body.listing.hostId.firstName).toBe('string');
    expect(Array.isArray(res.body.reviews)).toBe(true);
  });

  // scenario_18
  it('Should return 404 for a non-existent listing ID @p1 @regression', async () => {
    const res = await request(app).get('/api/listings/000000000000000000000000');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Listing not found');
  });

  // scenario_19
  it('Should check availability for a listing with available dates @p1 @regression', async () => {
    const res = await request(app).get(
      '/api/listings/607f1f77bcf86cd799439021/availability?startDate=2026-06-01&endDate=2026-06-07'
    );

    expect(res.status).toBe(200);
    expect(res.body.available).toBe(true);
    expect(res.body.blockedDates).toEqual([]);
  });

  // scenario_20
  it('Should check availability for a listing with conflicting dates @p1 @regression', async () => {
    const res = await request(app).get(
      '/api/listings/607f1f77bcf86cd799439021/availability?startDate=2024-11-15&endDate=2024-11-20'
    );

    expect(res.status).toBe(200);
    expect(res.body.available).toBe(false);
    expect(Array.isArray(res.body.blockedDates)).toBe(true);
    expect(res.body.blockedDates.length).toBeGreaterThan(0);
    expect(typeof res.body.blockedDates[0].checkIn).toBe('string');
    expect(typeof res.body.blockedDates[0].checkOut).toBe('string');
  });

  // scenario_21
  it('Should return 404 for availability check on non-existent listing @p2 @regression', async () => {
    const res = await request(app).get(
      '/api/listings/000000000000000000000000/availability?startDate=2026-06-01&endDate=2026-06-07'
    );

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Listing not found');
  });

  // scenario_22
  it('Should create a new listing as an authenticated host @p0 @sanity @regression', async () => {
    const res = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${abhishekToken}`)
      .send({
        title: 'Test Apartment',
        description: 'A test property description',
        propertyType: 'Apartment',
        price: 200,
        location: {
          address: '123 Test St',
          city: 'TestCity',
          state: 'California',
          country: 'United States',
          zipCode: '90001',
        },
        amenities: ['WiFi', 'Kitchen'],
        images: ['https://example.com/test.jpg'],
        bedrooms: 2,
        bathrooms: 1,
        maxGuests: 4,
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Listing created successfully');
    expect(typeof res.body.listing._id).toBe('string');
    expect(res.body.listing.title).toBe('Test Apartment');
    expect(res.body.listing.price).toBe(200);
    expect(typeof res.body.listing.hostId).toBe('string');
    expect(res.body.listing.isAvailable).toBe(true);
    expect(res.body.listing.rating).toBe(0);
    expect(res.body.listing.reviewCount).toBe(0);
  });

  // scenario_23
  it('Should return 401 when creating a listing without token @p1 @regression', async () => {
    const res = await request(app)
      .post('/api/listings')
      .send({ title: 'Test Listing', price: 200 });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  // scenario_24
  it('Should update a listing as the owner host @p1 @regression', async () => {
    const res = await request(app)
      .put('/api/listings/607f1f77bcf86cd799439021')
      .set('Authorization', `Bearer ${abhishekToken}`)
      .send({ price: 900, description: 'Updated description' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Listing updated successfully');
    expect(res.body.listing._id).toBe('607f1f77bcf86cd799439021');
    expect(res.body.listing.price).toBe(900);
  });

  // scenario_25
  it('Should return 403 when updating a listing as a non-owner @p1 @regression', async () => {
    const res = await request(app)
      .put('/api/listings/607f1f77bcf86cd799439021')
      .set('Authorization', `Bearer ${michaelToken}`)
      .send({ price: 999 });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Not authorized to update this listing');
  });

  // scenario_26
  it('Should return 404 when updating a non-existent listing @p2 @regression', async () => {
    const res = await request(app)
      .put('/api/listings/000000000000000000000000')
      .set('Authorization', `Bearer ${abhishekToken}`)
      .send({ price: 999 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Listing not found');
  });

  // scenario_27
  it('Should return 401 when updating a listing without token @p1 @regression', async () => {
    const res = await request(app)
      .put('/api/listings/607f1f77bcf86cd799439021')
      .send({ price: 999 });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  // scenario_28
  it('Should delete a listing as the owner host @p1 @regression', async () => {
    const res = await request(app)
      .delete('/api/listings/607f1f77bcf86cd799439024')
      .set('Authorization', `Bearer ${abhishekToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Listing deleted successfully');
  });

  // scenario_29
  it('Should return 403 when deleting a listing as a non-owner @p1 @regression', async () => {
    const res = await request(app)
      .delete('/api/listings/607f1f77bcf86cd799439021')
      .set('Authorization', `Bearer ${michaelToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Not authorized to delete this listing');
  });

  // scenario_30
  it('Should return 404 when deleting a non-existent listing @p2 @regression', async () => {
    const res = await request(app)
      .delete('/api/listings/000000000000000000000000')
      .set('Authorization', `Bearer ${abhishekToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Listing not found');
  });

  // scenario_31
  it('Should return 401 when deleting a listing without token @p1 @regression', async () => {
    const res = await request(app)
      .delete('/api/listings/607f1f77bcf86cd799439021');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });
});
