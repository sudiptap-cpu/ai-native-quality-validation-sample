import request from 'supertest';
import app from '../app';

/**
 * Test suite: listings module
 * Feature: @listings_guest_filter
 *
 * Covers the 'Adults needed check' PR which:
 *   - Adds Mumbai, India to the frontend destination list
 *   - Enforces that children/infants/pets require at least 1 adult in guest selection
 *
 * All tests run against the in-memory mock data via the mock controller —
 * no database connection is required.
 *
 * Total mock listings: 46
 * All are located in United States.
 * No Mumbai/India listings exist in mock data (Mumbai is a frontend-only addition).
 *
 * Austin listings (_id suffixes 023, 032, 038, 045):
 *   - 023: maxGuests=2
 *   - 032: maxGuests=3
 *   - 038: maxGuests=6
 *   - 045: maxGuests=2
 *
 * Listings with maxGuests >= 10:
 *   030 (10), 034 (12), 043 (10), 046 (14), 047 (10), 048 (12),
 *   056 (10), 062 (10), 064 (10), 066 (10) = 10 listings
 */

describe('@listings_guest_filter — GET /api/listings', () => {
  // ---------------------------------------------------------------------------
  // scenario_1: No filter — all listings returned
  // ---------------------------------------------------------------------------
  it(
    'Should return all listings when no guests filter is provided @p0 @sanity @regression',
    async () => {
      const res = await request(app).get('/api/listings');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('listings');
      expect(Array.isArray(res.body.listings)).toBe(true);
      expect(res.body).toHaveProperty('pagination');
      expect(typeof res.body.pagination.page).toBe('number');
      expect(typeof res.body.pagination.limit).toBe('number');
      expect(typeof res.body.pagination.total).toBe('number');
      expect(typeof res.body.pagination.pages).toBe('number');
    }
  );

  // ---------------------------------------------------------------------------
  // scenario_2: guests=1 — adults-only minimum
  // ---------------------------------------------------------------------------
  it(
    'Should return listings that accommodate exactly 1 guest when guests=1 (adults-only minimum) @p0 @sanity @regression',
    async () => {
      const res = await request(app).get('/api/listings').query({ guests: '1' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.listings)).toBe(true);

      for (const listing of res.body.listings) {
        expect(listing.maxGuests).toBeGreaterThanOrEqual(1);
      }

      // All 46 mock listings have maxGuests >= 1, so total must equal 46
      expect(res.body.pagination.total).toBe(46);
    }
  );

  // ---------------------------------------------------------------------------
  // scenario_3: guests=2 — 1 adult + 1 child
  // ---------------------------------------------------------------------------
  it(
    'Should return listings that accommodate 2 guests when guests=2 (1 adult + 1 child) @p0 @sanity @regression',
    async () => {
      const res = await request(app).get('/api/listings').query({ guests: '2' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.listings)).toBe(true);

      for (const listing of res.body.listings) {
        expect(listing.maxGuests).toBeGreaterThanOrEqual(2);
      }

      // No listing should have maxGuests < 2
      const underCapacity = res.body.listings.filter(
        (l: { maxGuests: number }) => l.maxGuests < 2
      );
      expect(underCapacity).toHaveLength(0);
    }
  );

  // ---------------------------------------------------------------------------
  // scenario_4: guests=10 — only large-capacity listings
  // ---------------------------------------------------------------------------
  it(
    'Should return only large-capacity listings when guests=10 @p1 @regression',
    async () => {
      const res = await request(app).get('/api/listings').query({ guests: '10' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.listings)).toBe(true);

      for (const listing of res.body.listings) {
        expect(listing.maxGuests).toBeGreaterThanOrEqual(10);
      }
    }
  );

  // ---------------------------------------------------------------------------
  // scenario_5: guests=100 — exceeds all maxGuests → empty result
  // ---------------------------------------------------------------------------
  it(
    'Should return no listings when guests count exceeds all available maxGuests @p1 @regression',
    async () => {
      const res = await request(app).get('/api/listings').query({ guests: '100' });

      expect(res.status).toBe(200);
      expect(res.body.listings).toHaveLength(0);
      expect(res.body.pagination.total).toBe(0);
    }
  );

  // ---------------------------------------------------------------------------
  // scenario_6: guests=0 — filter maxGuests >= 0 matches all
  // ---------------------------------------------------------------------------
  it(
    'Should return all listings when guests=0 (filter condition maxGuests >= 0 matches all) @p1 @regression',
    async () => {
      const res = await request(app).get('/api/listings').query({ guests: '0' });

      expect(res.status).toBe(200);
      expect(res.body.pagination.total).toBeGreaterThan(0);
    }
  );

  // ---------------------------------------------------------------------------
  // scenario_7: city=Austin — case-insensitive partial match
  // ---------------------------------------------------------------------------
  it(
    'Should return listings filtered by city using partial case-insensitive match @p0 @sanity @regression',
    async () => {
      const res = await request(app).get('/api/listings').query({ city: 'Austin' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.listings)).toBe(true);
      expect(res.body.pagination.total).toBeGreaterThan(0);

      for (const listing of res.body.listings) {
        expect(listing.location.city).toMatch(/austin/i);
      }
    }
  );

  // ---------------------------------------------------------------------------
  // scenario_8: city=Mumbai — no backend mock data for Mumbai
  // ---------------------------------------------------------------------------
  it(
    'Should return empty results when searching by city=Mumbai (new location in PR, no backend mock data) @p1 @regression',
    async () => {
      const res = await request(app).get('/api/listings').query({ city: 'Mumbai' });

      expect(res.status).toBe(200);
      expect(res.body.listings).toHaveLength(0);
      expect(res.body.pagination.total).toBe(0);
    }
  );

  // ---------------------------------------------------------------------------
  // scenario_9: country=India — no India listings in mock data
  // ---------------------------------------------------------------------------
  it(
    'Should return empty results when searching by country=India (no India listings in mock data) @p1 @regression',
    async () => {
      const res = await request(app).get('/api/listings').query({ country: 'India' });

      expect(res.status).toBe(200);
      expect(res.body.listings).toHaveLength(0);
      expect(res.body.pagination.total).toBe(0);
    }
  );

  // ---------------------------------------------------------------------------
  // scenario_10: country=United States — all mock listings match
  // ---------------------------------------------------------------------------
  it(
    'Should return listings when searching by country=United States @p0 @sanity @regression',
    async () => {
      const res = await request(app)
        .get('/api/listings')
        .query({ country: 'United States' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.listings)).toBe(true);
      expect(res.body.pagination.total).toBeGreaterThan(0);

      for (const listing of res.body.listings) {
        expect(listing.location.country).toMatch(/united states/i);
      }
    }
  );

  // ---------------------------------------------------------------------------
  // scenario_11: city=Austin + guests=2
  // ---------------------------------------------------------------------------
  it(
    'Should return listings combining city=Austin and guests=2 filters @p1 @regression',
    async () => {
      const res = await request(app)
        .get('/api/listings')
        .query({ city: 'Austin', guests: '2' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.listings)).toBe(true);

      for (const listing of res.body.listings) {
        expect(listing.location.city).toMatch(/austin/i);
        expect(listing.maxGuests).toBeGreaterThanOrEqual(2);
      }
    }
  );

  // ---------------------------------------------------------------------------
  // scenario_12: city=Austin + guests=6 — only high-capacity Austin listings
  // ---------------------------------------------------------------------------
  it(
    'Should return only high-capacity Austin listings when city=Austin and guests=6 @p1 @regression',
    async () => {
      const res = await request(app)
        .get('/api/listings')
        .query({ city: 'Austin', guests: '6' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.listings)).toBe(true);

      for (const listing of res.body.listings) {
        expect(listing.location.city).toMatch(/austin/i);
        expect(listing.maxGuests).toBeGreaterThanOrEqual(6);
      }

      // Only the Austin Penthouse (maxGuests=6) qualifies
      expect(res.body.pagination.total).toBe(1);
    }
  );

  // ---------------------------------------------------------------------------
  // scenario_13: city=Mumbai + guests=2 — empty (Mumbai has no mock data)
  // ---------------------------------------------------------------------------
  it(
    'Should return empty results combining Mumbai city filter with guests filter @p2 @regression',
    async () => {
      const res = await request(app)
        .get('/api/listings')
        .query({ city: 'Mumbai', guests: '2' });

      expect(res.status).toBe(200);
      expect(res.body.listings).toHaveLength(0);
      expect(res.body.pagination.total).toBe(0);
    }
  );

  // ---------------------------------------------------------------------------
  // scenario_14: guests=abc — non-numeric string → parseInt returns NaN
  // ---------------------------------------------------------------------------
  it(
    'Should return empty results when guests param is a non-numeric string @p2 @regression',
    async () => {
      const res = await request(app).get('/api/listings').query({ guests: 'abc' });

      expect(res.status).toBe(200);
      expect(res.body.listings).toHaveLength(0);
      expect(res.body.pagination.total).toBe(0);
    }
  );

  // ---------------------------------------------------------------------------
  // scenario_15: guests=2 + pagination (page=1, limit=5)
  // ---------------------------------------------------------------------------
  it(
    'Should support pagination on guest-filtered results @p2 @regression',
    async () => {
      const res = await request(app)
        .get('/api/listings')
        .query({ guests: '2', page: '1', limit: '5' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.listings)).toBe(true);
      expect(res.body.listings.length).toBeLessThanOrEqual(5);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(5);

      for (const listing of res.body.listings) {
        expect(listing.maxGuests).toBeGreaterThanOrEqual(2);
      }
    }
  );

  // ---------------------------------------------------------------------------
  // scenario_16: Host info embedded in each listing result
  // ---------------------------------------------------------------------------
  it(
    'Should return listing host info embedded in each result @p1 @regression',
    async () => {
      const res = await request(app).get('/api/listings').query({ guests: '1' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.listings)).toBe(true);
      expect(res.body.listings.length).toBeGreaterThan(0);

      for (const listing of res.body.listings) {
        expect(listing.hostId).toBeDefined();
        expect(listing.hostId).not.toBeNull();
        expect(listing.hostId).toHaveProperty('_id');
        expect(listing.hostId).toHaveProperty('firstName');
        expect(listing.hostId).toHaveProperty('lastName');
        expect(listing.hostId).toHaveProperty('avatar');
      }
    }
  );
});
