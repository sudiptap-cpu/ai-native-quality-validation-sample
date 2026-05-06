import { Request, Response } from 'express';
import { mockListings, mockReviews, mockUsers, mockBookings, findById } from '../data/mockData';
import { AuthRequest } from '../types';

export const getAllListings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      city,
      country,
      propertyType,
      minPrice,
      maxPrice,
      guests,
      bedrooms,
      bathrooms,
      amenities,
      page = 1,
      limit = 20,
    } = req.query;

    let filteredListings = [...mockListings];

    // Location filters
    if (city) {
      filteredListings = filteredListings.filter(listing =>
        listing.location.city.toLowerCase().includes((city as string).toLowerCase())
      );
    }
    if (country) {
      filteredListings = filteredListings.filter(listing =>
        listing.location.country.toLowerCase().includes((country as string).toLowerCase())
      );
    }

    // Property filters
    if (propertyType) {
      filteredListings = filteredListings.filter(
        listing => listing.propertyType === propertyType
      );
    }
    if (guests) {
      filteredListings = filteredListings.filter(
        listing => listing.maxGuests >= parseInt(guests as string)
      );
    }
    if (bedrooms) {
      filteredListings = filteredListings.filter(
        listing => listing.bedrooms >= parseInt(bedrooms as string)
      );
    }
    if (bathrooms) {
      filteredListings = filteredListings.filter(
        listing => listing.bathrooms >= parseFloat(bathrooms as string)
      );
    }

    // Price filters
    if (minPrice) {
      filteredListings = filteredListings.filter(
        listing => listing.price >= parseInt(minPrice as string)
      );
    }
    if (maxPrice) {
      filteredListings = filteredListings.filter(
        listing => listing.price <= parseInt(maxPrice as string)
      );
    }

    // Amenities filter
    if (amenities) {
      const amenitiesArray = (amenities as string).split(',');
      filteredListings = filteredListings.filter(listing =>
        amenitiesArray.every(amenity => listing.amenities.includes(amenity))
      );
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    const total = filteredListings.length;

    const paginatedListings = filteredListings.slice(skip, skip + limitNum);

    // Add host info to listings
    const listingsWithHost = paginatedListings.map(listing => {
      const host = findById(mockUsers, listing.hostId);
      return {
        ...listing,
        hostId: host ? {
          _id: host._id,
          firstName: host.firstName,
          lastName: host.lastName,
          avatar: host.avatar,
        } : null,
      };
    });

    res.json({
      listings: listingsWithHost,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
};

export const getListingById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const listing = findById(mockListings, id);

    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    // Get host info
    const host = findById(mockUsers, listing.hostId);

    // Get reviews for this listing
    const listingReviews = mockReviews.filter(review => review.listingId === id);

    // Add user info to reviews
    const reviewsWithUser = listingReviews.map(review => {
      const user = findById(mockUsers, review.userId);
      return {
        ...review,
        userId: user ? {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
        } : null,
      };
    });

    res.json({
      listing: {
        ...listing,
        hostId: host ? {
          _id: host._id,
          firstName: host.firstName,
          lastName: host.lastName,
          avatar: host.avatar,
          bio: host.bio,
          createdAt: host.createdAt,
        } : null,
      },
      reviews: reviewsWithUser,
    });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
};

export const createListing = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const newListing = {
      _id: `607f1f77bcf86cd7994391${String(mockListings.length + 1).padStart(2, '0')}`,
      ...req.body,
      hostId: req.user?.userId,
      rating: 0,
      reviewCount: 0,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockListings.push(newListing);

    res.status(201).json({
      message: 'Listing created successfully',
      listing: newListing,
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
};

export const updateListing = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const listingIndex = mockListings.findIndex(l => l._id === id);
    if (listingIndex === -1) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    const listing = mockListings[listingIndex];

    // Check if user is the host
    if (listing.hostId !== req.user?.userId) {
      res.status(403).json({ error: 'Not authorized to update this listing' });
      return;
    }

    mockListings[listingIndex] = {
      ...listing,
      ...req.body,
      updatedAt: new Date(),
    };

    res.json({
      message: 'Listing updated successfully',
      listing: mockListings[listingIndex],
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
};

export const deleteListing = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const listingIndex = mockListings.findIndex(l => l._id === id);
    if (listingIndex === -1) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    const listing = mockListings[listingIndex];

    // Check if user is the host
    if (listing.hostId !== req.user?.userId) {
      res.status(403).json({ error: 'Not authorized to delete this listing' });
      return;
    }

    mockListings.splice(listingIndex, 1);

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
};

export const getAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const listing = findById(mockListings, id);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    // Check for conflicting bookings
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const conflictingBookings = mockBookings.filter(booking => {
      if (booking.listingId !== id) return false;
      if (!['confirmed', 'pending'].includes(booking.status)) return false;

      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);

      return (
        (checkIn >= start && checkIn <= end) ||
        (checkOut >= start && checkOut <= end) ||
        (checkIn <= start && checkOut >= end)
      );
    });

    res.json({
      available: conflictingBookings.length === 0,
      blockedDates: conflictingBookings.map(booking => ({
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
      })),
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
};
