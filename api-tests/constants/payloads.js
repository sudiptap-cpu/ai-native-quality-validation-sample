'use strict';

const PAYLOADS = {
  auth: {
    loginAdmin: {
      email: 'lambdatestadmin@email.com',
      password: 'password123',
    },
    loginTestUser: {
      email: 'testuser@lambdatest.com',
      password: 'password123',
    },
    loginAbhishek: {
      email: 'abhishekkumar@lambdatest.com',
      password: 'password123',
    },
    loginEmmaDavis: {
      email: 'emma.davis@email.com',
      password: 'password123',
    },
    loginLoginTest: {
      email: 'logintest@lambdatest.com',
      password: 'password123',
    },
    wrongPassword: {
      email: 'lambdatestadmin@email.com',
      password: 'wrongpassword',
    },
    nonExistentUser: {
      email: 'nonexistent_user_xyz@test.com',
      password: 'password123',
    },
    updateProfile: {
      phone: '+1-555-0200',
      bio: 'Updated bio text',
    },
  },

  listings: {
    createListing: {
      title: 'Test Beach House',
      description: 'A lovely test property',
      propertyType: 'House',
      price: 300,
      location: {
        address: '123 Test St',
        city: 'Miami',
        state: 'Florida',
        country: 'United States',
        zipCode: '33101',
        coordinates: { lat: 25.77, lng: -80.19 },
      },
      amenities: ['WiFi', 'Kitchen'],
      images: ['https://example.com/img1.jpg'],
      bedrooms: 2,
      bathrooms: 1,
      maxGuests: 4,
    },
    updateListingPrice: {
      price: 900,
    },
  },

  bookings: {
    // Listing 607f1f77bcf86cd799439021 (Malibu Villa), price=850, 4 nights = 3400
    createBooking: {
      listingId: '607f1f77bcf86cd799439021',
      checkIn: '2027-07-01',
      checkOut: '2027-07-05',
      guests: 2,
    },
    nonExistentListing: {
      listingId: '000000000000000000000000',
      checkIn: '2027-08-01',
      checkOut: '2027-08-05',
      guests: 2,
    },
  },

  reviews: {
    createReview: {
      listingId: '607f1f77bcf86cd799439021',
      rating: 5,
      comment: 'Great place to stay!',
    },
  },
};

module.exports = PAYLOADS;
