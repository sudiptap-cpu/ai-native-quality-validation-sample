import { Request, Response } from 'express';
import Listing from '../models/Listing';
import Review from '../models/Review';
import Booking from '../models/Booking';
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
      beds,
      bathrooms,
      amenities,
      page = 1,
      limit = 20,
    } = req.query;

    const query: any = {};

    // Location filters
    if (city) query['location.city'] = new RegExp(city as string, 'i');
    if (country) query['location.country'] = new RegExp(country as string, 'i');

    // Property filters
    if (propertyType) query.propertyType = propertyType;
    if (guests) query.maxGuests = { $gte: parseInt(guests as string) };
    if (bedrooms) query.bedrooms = { $gte: parseInt(bedrooms as string) };
    if (beds) query.beds = { $gte: parseInt(beds as string) };
    if (bathrooms) query.bathrooms = { $gte: parseFloat(bathrooms as string) };

    // Price filters
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice as string);
      if (maxPrice) query.price.$lte = parseInt(maxPrice as string);
    }

    // Amenities filter
    if (amenities) {
      const amenitiesArray = (amenities as string).split(',');
      query.amenities = { $all: amenitiesArray };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [listings, total] = await Promise.all([
      Listing.find(query)
        .populate('hostId', 'firstName lastName avatar')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      Listing.countDocuments(query),
    ]);

    // Calculate ratings for each listing
    const listingsWithRatings = await Promise.all(
      listings.map(async (listing) => {
        const reviews = await Review.find({ listingId: listing._id });
        const rating =
          reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length
            : 0;

        return {
          ...listing.toObject(),
          rating: Math.round(rating * 10) / 10,
          reviewCount: reviews.length,
        };
      })
    );

    res.json({
      listings: listingsWithRatings,
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

    const listing = await Listing.findById(id).populate(
      'hostId',
      'firstName lastName avatar bio createdAt'
    );

    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    // Get reviews
    const reviews = await Review.find({ listingId: id }).populate(
      'userId',
      'firstName lastName avatar'
    );

    const rating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    res.json({
      listing: {
        ...listing.toObject(),
        rating: Math.round(rating * 10) / 10,
        reviewCount: reviews.length,
      },
      reviews,
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
    const listingData = {
      ...req.body,
      hostId: req.user?.userId,
    };

    const listing = await Listing.create(listingData);

    res.status(201).json({
      message: 'Listing created successfully',
      listing,
    });
  } catch (error: any) {
    console.error('Create listing error:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to create listing' });
  }
};

export const updateListing = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    // Check if user is the host
    if (listing.hostId.toString() !== req.user?.userId) {
      res.status(403).json({ error: 'Not authorized to update this listing' });
      return;
    }

    const updatedListing = await Listing.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      message: 'Listing updated successfully',
      listing: updatedListing,
    });
  } catch (error: any) {
    console.error('Update listing error:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to update listing' });
  }
};

export const deleteListing = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    // Check if user is the host
    if (listing.hostId.toString() !== req.user?.userId) {
      res.status(403).json({ error: 'Not authorized to delete this listing' });
      return;
    }

    await Listing.findByIdAndDelete(id);

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

    const listing = await Listing.findById(id);
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    const bookings = await Booking.find({
      listingId: id,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        {
          checkIn: {
            $gte: new Date(startDate as string),
            $lte: new Date(endDate as string),
          },
        },
        {
          checkOut: {
            $gte: new Date(startDate as string),
            $lte: new Date(endDate as string),
          },
        },
        {
          $and: [
            { checkIn: { $lte: new Date(startDate as string) } },
            { checkOut: { $gte: new Date(endDate as string) } },
          ],
        },
      ],
    });

    res.json({
      available: bookings.length === 0,
      blockedDates: bookings.map((booking) => ({
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
      })),
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
};
